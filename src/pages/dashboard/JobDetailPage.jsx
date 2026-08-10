import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import Loader from '@components/common/Loader';
import Card from '@components/common/Card';
import JobDetails from '@components/dashboard/JobDetails';
import { useAddJobNote, useJobDetail, useJobHistory } from '@hooks/useQueryHooks';
import { useToast } from '@hooks/useToast';
import { formatters } from '@utils/formatters';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@utils/constants';
import { IoArrowBackOutline, IoTimeOutline } from 'react-icons/io5';
import BillingSection from '@components/dashboard/BillingSection';
import { useAuthStore } from '@store/authStore';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: job, isLoading: jobLoading, error: jobError, refetch: refetchJob } = useJobDetail(id);
  const { data: history = [], isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useJobHistory(id);
  const { mutateAsync: addNote, isPending: noteSaving } = useAddJobNote(id);
  const [note, setNote] = React.useState('');
  const user = useAuthStore((s) => s.user);
  const isExternalIP = user?.is_internal === false;

  React.useEffect(() => {
    if (jobError) {
      toast.error(jobError.message || 'Failed to fetch job details');
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
        <p className="mb-4 text-sm text-muted-foreground">Check your connection and try again.</p>
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
  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await addNote(note);
      setNote('');
      toast.success('Job note added');
    } catch (error) {
      toast.error(error.message || 'Failed to add job note');
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
              <span className={JOB_STATUS_COLORS[job.status]}>
                {JOB_STATUS_LABELS[job.status] || job.status}
              </span>
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
          {isExternalIP && <BillingSection job={job} />}
          <Card title="Job activity">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Add progress note</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Record a site update or blocker"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <Button type="button" onClick={handleAddNote} disabled={noteSaving || !note.trim()}>
                {noteSaving ? 'Saving…' : 'Add note'}
              </Button>

              {historyLoading ? (
                <p className="text-sm text-muted-foreground">Loading activity…</p>
              ) : historyError ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">Could not load job activity.</p>
                  <Button type="button" variant="secondary" onClick={() => refetchHistory()}>Retry</Button>
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No job activity recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                      <IoTimeOutline className="mt-0.5 shrink-0 text-primary" size={18} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold capitalize text-foreground">{entry.status?.replaceAll('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{formatters.dateTime(entry.timestamp)}</p>
                        {entry.notes && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{entry.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
