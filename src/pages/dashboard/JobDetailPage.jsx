import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import Loader from '@components/common/Loader';
import Card from '@components/common/Card';
import JobDetails from '@components/dashboard/JobDetails';
import ProgressUpload from '@components/dashboard/ProgressUpload';
import ProgressTimeline from '@components/dashboard/ProgressTimeline';
import { useJobDetail, useJobProgress } from '@hooks/useQueryHooks';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@hooks/useToast';
import { formatters } from '@utils/formatters';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@utils/constants';
import { IoArrowBackOutline } from 'react-icons/io5';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading: jobLoading, error: jobError } = useJobDetail(id);
  const { data: progress = [] } = useJobProgress(id);

  React.useEffect(() => {
    if (jobError) {
      toast.error(jobError.message || 'Failed to fetch job details');
      if (jobError.status === 404) {
        navigate('/dashboard');
      }
    }
  }, [jobError, navigate, toast]);

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['partner-job-progress', id] });
    queryClient.invalidateQueries({ queryKey: ['partner-job', id] });
  };

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading job details..." />
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
  const progressUpdates = Array.isArray(progress) ? progress.filter(Boolean) : [];
  const latestFirstProgress = [...progressUpdates].sort(
    (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
  );

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
              <span className={JOB_STATUS_COLORS[job.status]}>
                {JOB_STATUS_LABELS[job.status] || job.status}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Last update: {latestFirstProgress[0]?.uploaded_at
                ? formatters.dateTime(latestFirstProgress[0].uploaded_at)
                : 'No uploads yet'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="dashboard-hero-stat">
              <p className="text-xs text-muted-foreground">Delivery Date</p>
              <p className="text-base font-semibold text-foreground">
                {formatters.date(job.delivery_date) || 'Not set'}
              </p>
            </div>
            <div className="dashboard-hero-stat">
              <p className="text-xs text-muted-foreground">Checklists</p>
              <p className="text-base font-semibold text-foreground">
                {checklists.length}
              </p>
            </div>
            <div className="dashboard-hero-stat">
              <p className="text-xs text-muted-foreground">Progress Updates</p>
              <p className="text-base font-semibold text-foreground">
                {latestFirstProgress.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-6 items-start">
        <div className="space-y-6">
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
                  <button
                    key={checklist.id}
                    type="button"
                    onClick={() => {
                      navigate(`/dashboard/jobs/${job.id}/checklist/${checklist.id}`);
                    }}
                    className="dashboard-filter-btn justify-between"
                  >
                    <span className="truncate">{checklist.name}</span>
                    <span className="dashboard-filter-count">
                      Open
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No checklists are attached to this job yet.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <ProgressUpload
            jobId={job.id}
            onUploadSuccess={handleUploadSuccess}
          />

          <ProgressTimeline progress={latestFirstProgress} />
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
