import React, { useRef, useState } from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { useDailyUpdates, useSubmitDailyUpdate } from '@hooks/useQueryHooks';
import { useToast } from '@hooks/useToast';
import { formatters } from '@utils/formatters';
import {
  IoCloudUploadOutline,
  IoCloseCircleOutline,
  IoImagesOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoAddOutline,
} from 'react-icons/io5';

const MAX_PHOTOS = 5;
const todayISO = () => new Date().toISOString().split('T')[0];

const DailyJobUpdate = ({ jobId }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [photos, setPhotos] = useState([]);  // Array of { file, preview }
  const [notes, setNotes] = useState('');

  const { data: updates = [], isLoading: loadingHistory } = useDailyUpdates(jobId);
  const { mutateAsync: submit, isPending } = useSubmitDailyUpdate(jobId);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = newFiles.slice(0, remaining);

    if (newFiles.length > remaining) {
      toast.error(`Maximum ${MAX_PHOTOS} photos per update`);
    }

    const mapped = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...mapped]);
    e.target.value = '';
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (photos.length === 0) {
      toast.error('At least one photo is required');
      return;
    }

    try {
      await submit({
        notes,
        updateDate: todayISO(),
        photos: photos.map((p) => p.file),
      });
      toast.success('Daily update submitted');
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      setNotes('');
    } catch (err) {
      toast.error(err.message || 'Failed to submit update');
    }
  };

  return (
    <Card
      title="Daily Update"
      headerRight={
        <span className="text-xs text-muted-foreground">
          {updates.length} submitted
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* Photo grid */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
            Photos <span className="text-destructive">*</span>
            <span className="normal-case font-normal ml-1">({photos.length}/{MAX_PHOTOS})</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {photos.map(({ preview }, index) => (
              <div key={index} className="relative w-20 h-20 flex-shrink-0">
                <img
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute -top-1.5 -right-1.5 text-white bg-destructive rounded-full p-0.5 hover:opacity-80"
                >
                  <IoCloseCircleOutline size={18} />
                </button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background hover:bg-surface transition-colors gap-1"
              >
                <IoAddOutline size={22} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add photo</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe today's progress, issues, or observations…"
            maxLength={2000}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary resize-none"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending || photos.length === 0}
        >
          <IoCloudUploadOutline size={16} />
          {isPending ? 'Submitting…' : 'Submit Update'}
        </Button>
      </form>

      {/* History */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          History ({updates.length})
        </p>

        {loadingHistory ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : updates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No updates submitted yet.</p>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {updates.map((update) => (
              <div
                key={update.id}
                className="rounded-lg border border-border bg-surface p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <IoCalendarOutline size={13} />
                    {new Date(update.update_date).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <IoTimeOutline size={12} />
                    {formatters.dateTime(update.created_at)}
                  </div>
                </div>

                {update.notes && (
                  <p className="text-foreground leading-relaxed">{update.notes}</p>
                )}

                {update.photos?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {update.photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <img
                          src={photo.photo_url}
                          alt="Update photo"
                          className="w-24 h-24 object-cover rounded-md border border-border hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 text-muted-foreground">
                  <IoImagesOutline size={12} />
                  {update.photos?.length ?? 0} photo{update.photos?.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DailyJobUpdate;
