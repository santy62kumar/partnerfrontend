import { useEffect, useRef, useState } from 'react';
import { compressImageFile } from '@utils/image';
import { useToast } from '@hooks/useToast';
import { MAX_PROGRESS_PHOTOS, MAX_PROGRESS_PHOTO_BYTES } from '@utils/dailyReport';

/** Progress photo picking, compression, capping and object-URL cleanup. */
export const useProgressPhotos = () => {
  const toast = useToast();
  const [photos, setPhotos] = useState([]);
  const photosRef = useRef([]);

  useEffect(() => { photosRef.current = photos; }, [photos]);

  // Revoke on unmount only — a deps array on `photos` would revoke previews
  // that are still on screen, hence reading the latest set through the ref.
  useEffect(() => () => photosRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview)), []);

  const add = async (event) => {
    const available = MAX_PROGRESS_PHOTOS - photos.length;
    const selected = Array.from(event.target.files || []).slice(0, available);
    const files = (await Promise.all(selected.map(compressImageFile))).filter(Boolean);
    const valid = files.filter((file) => file.size <= MAX_PROGRESS_PHOTO_BYTES);
    setPhotos((current) => [
      ...current,
      ...valid.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    if (valid.length < files.length) {
      toast.error('Each progress photo must be 2 MB or smaller after compression');
    }
    if ((event.target.files?.length || 0) > available) {
      toast.error(`Attach at most ${MAX_PROGRESS_PHOTOS} progress photos`);
    }
    event.target.value = '';
  };

  const remove = (index) => {
    setPhotos((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, i) => i !== index);
    });
  };

  const reset = () => {
    photosRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setPhotos([]);
  };

  return { photos, add, remove, reset, files: photos.map(({ file }) => file) };
};

