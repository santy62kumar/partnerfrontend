import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import Loader from '@components/common/Loader';
import Card from '@components/common/Card';
import JobDetails from '@components/dashboard/JobDetails';
import { useFinishJob, useJobDetail, useRequestEndOtp, useRequestStartOtp, useStartJob } from '@hooks/useQueryHooks';
import { useToast } from '@hooks/useToast';
import { JOB_STATUS_LABELS } from '@utils/constants';
import { JOB_STATUS_TONE } from '@utils/status';
import StatusBadge from '@components/common/StatusBadge';
import { IoArrowBackOutline } from 'react-icons/io5';
import BillingSection from '@components/dashboard/BillingSection';
import { useAuthStore } from '@store/authStore';
import { dashboardApi } from '@api/dashboardApi';
import {
  DOCUMENT_LABELS,
  closureDocuments,
  completionDocumentLink,
} from '@utils/jobDocuments';
import { getApiErrorMessage, getApiFieldErrors } from '../../api/apiErrors';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: job, isLoading: jobLoading, error: jobError, refetch: refetchJob } = useJobDetail(id);
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const { mutateAsync: requestStartOtp, isPending: otpSending } = useRequestStartOtp(id);
  const { mutateAsync: startJob, isPending: starting } = useStartJob(id);
  const [endOtp, setEndOtp] = React.useState('');
  const [endOtpSent, setEndOtpSent] = React.useState(false);
  const { mutateAsync: requestEndOtp, isPending: endOtpSending } = useRequestEndOtp(id);
  const { mutateAsync: finishJob, isPending: finishing } = useFinishJob(id);
  const [uploadingDocument, setUploadingDocument] = React.useState(null);
  const [startFieldErrors, setStartFieldErrors] = React.useState({});
  const [finishFieldErrors, setFinishFieldErrors] = React.useState({});
  const user = useAuthStore((s) => s.user);
  const isExternalIP = user?.is_internal === false;

  React.useEffect(() => {
    if (jobError) {
      toast.error(getApiErrorMessage(jobError));
      if (jobError.status === 404) {
        navigate('/dashboard');
      }
    }
  }, [jobError, navigate, toast]);

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading job details..." />
      </div>
    );
  }

  if (jobError && jobError.status !== 404) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Could not load job</h2>
        <p className="mb-4 text-sm text-destructive">{getApiErrorMessage(jobError)}</p>
        <Button variant="primary" onClick={() => refetchJob()}>Retry</Button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Job Not Found
        </h2>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const checklists = Array.isArray(job.checklists) ? job.checklists : [];
  const canStart = job.status === 'created' || job.status === 'paused';
  const canFinish = job.status === 'in_progress';
  const needsOtp = Boolean(job.customer_phone);
  const requiredCompletionDocuments = closureDocuments(job.type);
  const allCompletionDocumentsAttached = requiredCompletionDocuments.every((slot) =>
    completionDocumentLink(job, slot),
  );

  const handleSendOtp = async () => {
    try {
      await requestStartOtp();
      setOtpSent(true);
      toast.success(`OTP sent to the customer on ${job.customer_phone}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleStart = async () => {
    try {
      setStartFieldErrors({});
      await startJob({ otp: needsOtp ? otp.trim() : undefined });
      setOtp('');
      setOtpSent(false);
      toast.success(job.status === 'paused' ? 'Job resumed' : 'Job started');
    } catch (error) {
      setStartFieldErrors(getApiFieldErrors(error));
      toast.error(getApiErrorMessage(error));
    }
  };


  const handleSendEndOtp = async () => {
    try {
      await requestEndOtp();
      setEndOtpSent(true);
      toast.success(`OTP sent to the customer on ${job.customer_phone}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleFinish = async () => {
    try {
      setFinishFieldErrors({});
      await finishJob({ otp: needsOtp ? endOtp.trim() : undefined });
      setEndOtp('');
      setEndOtpSent(false);
      toast.success('Job completed');
    } catch (error) {
      // The backend names the missing closure document, so surface it verbatim.
      setFinishFieldErrors(getApiFieldErrors(error));
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleCompletionDocumentUpload = async (slot, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingDocument(slot);
    try {
      await dashboardApi.uploadCompletionDocument(id, slot, file);
      await refetchJob();
      toast.success(`${DOCUMENT_LABELS[slot]} attached`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploadingDocument(null);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/dashboard')}
        className="w-fit"
      >
        <IoArrowBackOutline size={20} />
        Back to Dashboard
      </Button>

      <section className="dashboard-hero">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Job Workspace
              </p>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">
                {job.name}
              </h1>
              <StatusBadge tone={JOB_STATUS_TONE[job.status]}>
                {JOB_STATUS_LABELS[job.status] || job.status}
              </StatusBadge>
            </div>

          </div>
        </div>
      </section>

      {job._partialError ? (
        <Card className="border-warning/30 bg-warning/10" padding="p-4">
          <p role="alert" className="text-sm text-warning">Job details loaded, but checklists are unavailable. {getApiErrorMessage(job._partialError)}</p>
        </Card>
      ) : null}

      <div className={`grid grid-cols-1 gap-6 items-start ${isExternalIP ? 'xl:grid-cols-[1.25fr_1fr]' : ''}`}>
        <div className="space-y-6">
          {canStart && (
            <Card title={job.status === 'paused' ? 'Resume this job' : 'Start this job'}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {needsOtp
                    ? 'Send the customer a one-time code and enter it here to go on site.'
                    : 'No customer phone is on file, so this job starts without an OTP.'}
                </p>
                {needsOtp ? (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                        inputMode="numeric"
                        placeholder="Customer OTP"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:max-w-[12rem]"
                        aria-invalid={Boolean(startFieldErrors.otp)}
                      />
                      <Button type="button" variant="secondary" onClick={handleSendOtp} disabled={otpSending}>
                        {otpSending ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                      <Button type="button" onClick={handleStart} disabled={starting || otp.trim().length === 0}>
                        {starting ? 'Starting…' : job.status === 'paused' ? 'Resume job' : 'Start job'}
                      </Button>
                    </div>
                    {startFieldErrors.otp ? <p className="text-xs text-destructive">{startFieldErrors.otp}</p> : null}
                  </>
                ) : (
                  <Button type="button" onClick={handleStart} disabled={starting}>
                    {starting ? 'Starting…' : job.status === 'paused' ? 'Resume job' : 'Start job'}
                  </Button>
                )}
              </div>
            </Card>
          )}

          {canFinish && (
            <Card title="Complete this job">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {needsOtp
                    ? 'Send the customer a one-time code and enter it here to close the job.'
                    : 'No customer phone is on file, so this job closes without an OTP.'}
                </p>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Required before completion</p>
                  <ul className="mt-3 grid gap-2" aria-label="Required completion documents">
                    {requiredCompletionDocuments.map((slot) => {
                      const link = completionDocumentLink(job, slot);
                      const uploading = uploadingDocument === slot;
                      return (
                        <li key={slot} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${link ? 'bg-success' : 'bg-warning'}`}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-foreground">
                              {DOCUMENT_LABELS[slot]}
                            </span>
                            <span className={`block text-xs ${link ? 'text-success' : 'text-muted-foreground'}`}>
                              {link ? 'Attached and ready' : 'Upload required'}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            {link && (
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-primary hover:underline"
                              >
                                View
                              </a>
                            )}
                            <label
                              className={`inline-flex h-9 cursor-pointer items-center rounded-md border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                            >
                              {uploading ? 'Uploading…' : link ? 'Replace' : 'Upload'}
                              <input
                                type="file"
                                className="sr-only"
                                accept={slot === 'project_report' ? '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx' : '.pdf,.jpg,.jpeg,.png,.doc,.docx'}
                                disabled={uploading}
                                aria-label={`${link ? 'Replace' : 'Upload'} ${DOCUMENT_LABELS[slot]}`}
                                onChange={(event) => handleCompletionDocumentUpload(slot, event)}
                              />
                            </label>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {needsOtp ? (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={endOtp}
                        onChange={(event) => setEndOtp(event.target.value.replace(/\D/g, ''))}
                        inputMode="numeric"
                        placeholder="Customer OTP"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:max-w-[12rem]"
                        aria-invalid={Boolean(finishFieldErrors.otp)}
                      />
                      <Button type="button" variant="secondary" onClick={handleSendEndOtp} disabled={endOtpSending}>
                        {endOtpSending ? 'Sending…' : endOtpSent ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                      <Button type="button" onClick={handleFinish} disabled={finishing || !allCompletionDocumentsAttached || endOtp.trim().length === 0}>
                        {finishing ? 'Completing…' : 'Complete job'}
                      </Button>
                    </div>
                    {finishFieldErrors.otp ? <p className="text-xs text-destructive">{finishFieldErrors.otp}</p> : null}
                  </>
                ) : (
                  <Button type="button" onClick={handleFinish} disabled={finishing || !allCompletionDocumentsAttached}>
                    {finishing ? 'Completing…' : 'Complete job'}
                  </Button>
                )}
              </div>
            </Card>
          )}

          <JobDetails job={job} />

          <Card
            title="Checklists"
            headerRight={(
              <span className="text-xs text-muted-foreground">
                {checklists.length} linked
              </span>
            )}
          >
            {checklists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checklists.map((checklist) => (
                  <Button
                    variant="outline"
                    size="sm"
                    key={checklist.id}
                    type="button"
                    onClick={() => {
                      navigate(`/dashboard/jobs/${job.id}/checklist/${checklist.id}`);
                    }}
                    className="justify-between"
                  >
                    <span className="truncate">{checklist.name}</span>
                    <span className="dashboard-filter-count">
                      Open
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No checklists are attached to this job yet.
              </p>
            )}
          </Card>
        </div>

        {isExternalIP && (
          <div className="space-y-6">
            <BillingSection job={job} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;
