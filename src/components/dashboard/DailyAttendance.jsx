import React, { useEffect, useRef, useState } from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { useAttendance, useRecordAttendance } from '@hooks/useQueryHooks';
import { useToast } from '@hooks/useToast';
import { formatters } from '@utils/formatters';
import { IoLocationOutline, IoTimeOutline, IoCallOutline, IoCameraOutline, IoCloseCircleOutline, IoCameraReverseOutline } from 'react-icons/io5';

const DailyAttendance = () => {
  const toast = useToast();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [openingCamera, setOpeningCamera] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { data: records = [], isLoading } = useAttendance();
  const { mutateAsync: record, isPending } = useRecordAttendance();

  const stopCameraStream = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopCameraStream(), []);
  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const openCamera = async (mode = facingMode) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Camera is not supported on this device/browser');
      return;
    }

    setOpeningCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      toast.error('Unable to access camera. Please allow camera permission.');
    } finally {
      setOpeningCamera(false);
    }
  };

  const handleSwitchCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    stopCameraStream();
    await openCamera(next);
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) {
      toast.error('Failed to capture photo. Please try again.');
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const file = new File([blob], `attendance-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setCameraOpen(false);
    stopCameraStream();
  };

  const handleCloseCamera = () => {
    setCameraOpen(false);
    stopCameraStream();
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      toast.error('Photo is required for attendance');
      return;
    }

    setLocating(true);
    let latitude, longitude;
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
        })
      );
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch {
      toast.error('Could not get location. Please allow location access.');
      setLocating(false);
      return;
    } finally {
      setLocating(false);
    }

    try {
      await record({ latitude, longitude, manualLocation, photoFile });
      toast.success('Attendance recorded');
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoFile(null);
      setPhotoPreview(null);
      setManualLocation('');
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
    }
  };

  return (
    <Card title="Daily Attendance">
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Attendance Photo <span className="text-destructive">*</span>
          </label>

          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Attendance"
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-0.5 hover:bg-black/80"
              >
                <IoCloseCircleOutline size={22} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openCamera}
              disabled={openingCamera}
              className="flex flex-col items-center justify-center w-full h-36 rounded-lg border-2 border-dashed border-border bg-background cursor-pointer hover:bg-surface transition-colors gap-2 disabled:opacity-60"
            >
              <IoCameraOutline size={32} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">
                {openingCamera ? 'Opening camera...' : 'Click to capture photo'}
              </span>
              <span className="text-xs text-muted-foreground">Required for attendance</span>
            </button>
          )}
          {cameraOpen && (
            <div className="mt-3 space-y-3">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-56 rounded-lg border border-border bg-black object-cover" />
              <div className="flex gap-2">
                <Button type="button" variant="primary" className="flex-1" onClick={handleCapturePhoto}>
                  Capture
                </Button>
                <Button type="button" className="flex-1" onClick={handleSwitchCamera} disabled={openingCamera}>
                  <IoCameraReverseOutline size={16} />
                  {facingMode === 'environment' ? 'Front' : 'Back'}
                </Button>
                <Button type="button" className="flex-1" onClick={handleCloseCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Manual Location (optional)
          </label>
          <input
            type="text"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            placeholder="Site name, landmark, floor, or area"
            maxLength={255}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending || locating || !photoFile}
        >
          <IoLocationOutline size={16} />
          {locating ? 'Getting location…' : isPending ? 'Saving…' : 'Mark Attendance'}
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Today's Records ({records.length})
        </p>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {records.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-border bg-surface p-3 text-xs space-y-1"
              >
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <IoCallOutline size={13} />
                  {r.phone}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IoLocationOutline size={13} />
                  {r.latitude.toFixed(6)}, {r.longitude.toFixed(6)}
                </div>
                {r.manual_location && (
                  <div className="text-muted-foreground">
                    Manual: {r.manual_location}
                  </div>
                )}
                {r.photo_url && (
                  <img
                    src={r.photo_url}
                    alt="Attendance"
                    className="w-full h-28 object-cover rounded-md mt-1"
                  />
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IoTimeOutline size={13} />
                  {formatters.dateTime(r.recorded_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DailyAttendance;
