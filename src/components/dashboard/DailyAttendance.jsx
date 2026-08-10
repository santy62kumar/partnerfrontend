import React, { useEffect, useRef, useState } from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { useAttendance, useJobs, useRecordAttendance } from '@hooks/useQueryHooks';
import { dashboardApi } from '@api/dashboardApi';
import { useToast } from '@hooks/useToast';
import { formatters } from '@utils/formatters';
import { captureVideoFrame, compressImageFile } from '@utils/image';
import { IoLocationOutline, IoTimeOutline, IoCallOutline, IoCameraOutline, IoCloseCircleOutline, IoCameraReverseOutline } from 'react-icons/io5';
import Modal from '@components/common/Modal';

// Local date, not toISOString() — that is UTC and rolls the day over early in IST.
const nextSundayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const MAX_ATTENDANCE_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_REPORT_FILE_BYTES = 10 * 1024 * 1024;

const DailyAttendance = () => {
  const toast = useToast();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [openingCamera, setOpeningCamera] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [attendanceType, setAttendanceType] = useState('check_in');
  const [jobId, setJobId] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [sundayBlocked, setSundayBlocked] = useState(false);
  const [sundayRequest, setSundayRequest] = useState(null);
  const [sundayReason, setSundayReason] = useState('');
  const [sundaySubmitting, setSundaySubmitting] = useState(false);
  const [sundayModalVisible, setSundayModalVisible] = useState(false);
  const [sundayRequests, setSundayRequests] = useState([]);
  const [requestDate, setRequestDate] = useState(nextSundayISO());
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { data: attendance = { records: [], missing_reports: [] }, isLoading, error: attendanceError, refetch: refetchAttendance } = useAttendance();
  const { data: jobs = [], isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = useJobs();
  const records = attendance.records || [];
  const missingReports = attendance.missing_reports || [];
  const activeJobs = jobs.filter((job) => job.status === 'in_progress');
  const { mutateAsync: record, isPending } = useRecordAttendance();

  const fetchSundayRequests = async () => {
    try {
      const existing = await dashboardApi.getSundayRequests();
      const requests = existing || [];
      const today = requests.find((request) => request.request_date === todayISO()) || null;
      setSundayRequests(requests);
      setSundayRequest(today);
      if (new Date().getDay() === 0) {
        setSundayBlocked(!today || today.status !== 'approved');
      }
    } catch {
      toast.error('Failed to load Sunday requests');
    }
  };

  const stopCameraStream = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopCameraStream(), []);

  useEffect(() => {
    if (new Date().getDay() !== 0) return;
    dashboardApi.getSundayRequests()
      .then((existing) => {
        const requests = existing || [];
        const today = requests.find((request) => request.request_date === todayISO()) || null;
        setSundayRequests(requests);
        setSundayRequest(today);
        setSundayBlocked(!today || today.status !== 'approved');
      })
      .catch(() => {});
  }, []);
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
    if (!videoRef.current) return;

    const file = await captureVideoFrame(videoRef.current, `attendance-${Date.now()}.jpg`);
    if (!file) {
      toast.error('Failed to capture photo. Please try again.');
      return;
    }
    if (file.size > MAX_ATTENDANCE_PHOTO_BYTES) {
      toast.error('Attendance photo must be 5 MB or smaller');
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
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

  const handleReportFile = async (event) => {
    const file = await compressImageFile(event.target.files?.[0]);
    if (file?.size > MAX_REPORT_FILE_BYTES) {
      setReportFile(null);
      event.target.value = '';
      toast.error('Daily Installation Report must be 10 MB or smaller');
      return;
    }
    setReportFile(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      toast.error('Photo is required for attendance');
      return;
    }
    if (!manualLocation.trim()) {
      toast.error('Site location is required for attendance');
      return;
    }
    if (attendanceType === 'check_out' && !reportFile) {
      toast.error('Upload the completed Daily Installation Report');
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
      const result = await record({
        jobId,
        latitude,
        longitude,
        manualLocation,
        photoFile,
        attendanceType,
        reportFile: attendanceType === 'check_out' ? reportFile : null,
        sundayReason: sundayReason.trim() || undefined,
      });

      const clearForm = () => {
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoFile(null);
        setPhotoPreview(null);
        setManualLocation('');
        setReportFile(null);
      };

      // Sunday: the attempt was filed for approval instead of recorded. The GPS fix
      // and photo travelled with it, so there is nothing to submit again once it is
      // granted. Answers 202, which axios treats as success — without this branch the
      // user is told the check-in was recorded when it was not.
      if (result?.status === 'pending_approval') {
        toast.success(result.message || 'Approval request sent to superadmin');
        clearForm();
        setSundayReason('');
        setSundayBlocked(true);
        await fetchSundayRequests();
        return;
      }

      toast.success(attendanceType === 'check_in' ? 'Check-in recorded' : 'Check-out and report submitted');
      clearForm();
    } catch (err) {
      // 409 covers a request already waiting on the superadmin, 403 a rejected one.
      // Either way, show the request panel instead of leaving the user at a dead end.
      if ((err.status === 403 || err.status === 409) && /sunday/i.test(err.message || '')) {
        setSundayBlocked(true);
        await fetchSundayRequests();
      }
      toast.error(err.message || 'Failed to record attendance');
    }
  };

  const submitSundayRequest = async (isModal = false) => {
    const selectedDate = isModal ? requestDate : todayISO();
    setSundaySubmitting(true);
    try {
      const created = await dashboardApi.createSundayRequest({
        requestDate: selectedDate,
        reason: sundayReason,
      });
      setSundayRequests((current) => [created, ...current.filter((request) => request.id !== created.id)]);
      if (selectedDate === todayISO()) {
        setSundayRequest(created);
        setSundayBlocked(created.status !== 'approved');
      }
      setSundayReason('');
      toast.success('Request sent for superadmin approval');
    } catch (err) {
      toast.error(err.message || 'Failed to submit Sunday work request');
    } finally {
      setSundaySubmitting(false);
    }
  };

  const selectedSundayRequest = sundayRequests.find((request) => request.request_date === requestDate);

  return (
    <Card title="Daily Attendance">
      {sundayBlocked && (
        <div className="mb-4 space-y-2 rounded-lg border border-destructive/40 p-3">
          <p className="text-sm font-semibold text-destructive">Sunday work needs approval</p>
          {sundayRequest ? (
            <p className="text-xs text-muted-foreground">
              {sundayRequest.status === 'pending'
                ? 'Your request for today is pending superadmin approval.'
                : `Your request for today was ${sundayRequest.status}.`}
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Send a request for today and a superadmin will review it.
              </p>
              <textarea
                value={sundayReason}
                onChange={(event) => setSundayReason(event.target.value)}
                placeholder="Reason (optional)"
                maxLength={500}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <Button type="button" disabled={sundaySubmitting} onClick={submitSundayRequest}>
                {sundaySubmitting ? 'Sending…' : 'Request Sunday work'}
              </Button>
            </>
          )}
        </div>
      )}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setRequestDate(nextSundayISO());
            fetchSundayRequests();
            setSundayModalVisible(true);
          }}
          className="w-full flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-surface transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Manage Sunday Work Requests</span>
          </div>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant={attendanceType === 'check_in' ? 'primary' : 'secondary'} onClick={() => setAttendanceType('check_in')}>
            Check In
          </Button>
          <Button type="button" variant={attendanceType === 'check_out' ? 'primary' : 'secondary'} onClick={() => setAttendanceType('check_out')}>
            Check Out
          </Button>
        </div>
        <div>
          <label htmlFor="attendance-job" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Job (Optional)
          </label>
          <select
            id="attendance-job"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            disabled={jobsLoading || !!jobsError}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">No job / General attendance</option>
            {activeJobs.map((job) => (
              <option key={job.id} value={job.id}>{job.name || `Job ${job.id}`} · ID {job.id}</option>
            ))}
          </select>
          {jobsLoading && <p className="mt-1 text-xs text-muted-foreground">Loading jobs…</p>}
          {jobsError && (
            <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => refetchJobs()}>Retry jobs</Button>
          )}
        </div>
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
                aria-label="Remove attendance photo"
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

        </div>

        {attendanceType === 'check_out' && (
          <div className="space-y-4 rounded-lg border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Daily Installation Report <span className="text-destructive">*</span>
            </p>
            <p className="text-xs text-muted-foreground">Generate the report from Daily Report, then upload PDF, JPG, PNG, DOC or DOCX · maximum 10 MB.</p>
            <input
              aria-label="Upload completed Daily Installation Report"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              onChange={handleReportFile}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Site Location <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            placeholder="Site name, landmark, floor, or area"
            maxLength={255}
            required
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
          {locating ? 'Getting location…' : isPending ? 'Saving…' : attendanceType === 'check_in' ? 'Mark Check In' : 'Mark Check Out'}
        </Button>
      </form>

      <div className="space-y-2">
        {missingReports.length > 0 && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Daily report required:</strong> {missingReports.map((item) => `${item.job_id ? `Job ${item.job_id}` : 'General attendance'} (${item.attendance_date})`).join(', ')}
          </div>
        )}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Attendance Records ({records.length})
        </p>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : attendanceError ? (
          <div className="space-y-2">
            <p className="text-sm text-destructive">Could not load attendance records.</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => refetchAttendance()}>Retry</Button>
          </div>
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
                <div className="font-semibold text-primary">
                  {r.attendance_type === 'check_out' ? 'Check Out' : 'Check In'}
                </div>
                <div className="text-foreground">
                  Job: {r.job_id ? (jobs.find((job) => job.id === r.job_id)?.name || `#${r.job_id}`) : 'None'}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IoLocationOutline size={13} />
                  {Number(r.latitude).toFixed(6)}, {Number(r.longitude).toFixed(6)}
                </div>
                {r.manual_location && (
                  <div className="text-muted-foreground">
                    Location: {r.manual_location}
                  </div>
                )}
                {r.photo_url && (
                  <img
                    src={r.photo_url}
                    alt="Attendance"
                    className="w-full h-28 object-cover rounded-md mt-1"
                  />
                )}
                {r.report_document_url && (
                  <a href={r.report_document_url} download target="_blank" rel="noreferrer" className="inline-block font-medium text-primary underline">
                    Download Daily Installation Report
                  </a>
                )}
                {r.report_status === 'submitted_late' && <div className="font-semibold text-destructive">Submitted late</div>}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IoTimeOutline size={13} />
                  {formatters.dateTime(r.recorded_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={sundayModalVisible} onClose={() => setSundayModalVisible(false)} title="Sunday Work Requests">
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="sunday-request-date" className="text-sm font-semibold text-foreground">Request date</label>
            <input
              id="sunday-request-date"
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {selectedSundayRequest ? (
              <p className="text-sm text-muted-foreground">
                A request for this date is already {selectedSundayRequest.status}.
              </p>
            ) : (
              <>
                <label htmlFor="sunday-request-reason" className="text-sm font-semibold text-foreground block">Reason</label>
                <textarea
                  id="sunday-request-reason"
                  value={sundayReason}
                  onChange={(e) => setSundayReason(e.target.value)}
                  placeholder="Reason (optional)"
                  maxLength={500}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <Button type="button" disabled={sundaySubmitting} onClick={() => submitSundayRequest(true)} className="w-full">
                  {sundaySubmitting ? 'Sending...' : 'Request Sunday work'}
                </Button>
              </>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Previous Requests</h4>
            {sundayRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests found.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {sundayRequests.map((req) => (
                  <div key={req.id} className="rounded-lg border border-border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{req.request_date}</span>
                      <span className={`text-xs font-bold ${req.status === 'approved' ? 'text-green-600' : req.status === 'rejected' ? 'text-destructive' : 'text-orange-500'}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    {req.reason && <p className="text-xs text-muted-foreground mt-1">Reason: {req.reason}</p>}
                    {req.review_notes && <p className="text-xs text-muted-foreground mt-1">Notes: {req.review_notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default DailyAttendance;
