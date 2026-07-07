import React, { useEffect } from 'react';
import StatsCards from '@components/dashboard/StatsCards';
import JobFilters from '@components/dashboard/JobFilters';
import JobList from '@components/dashboard/JobList';
import Loader from '@components/common/Loader';
import { useDashboardStore } from '@store/dashboardStore';
import { useJobs } from '@hooks/useQueryHooks';
import { useToast } from '@hooks/useToast';
import { JOB_STATUS_LABELS } from '@utils/constants';
import { Card, CardContent } from '@components/ui/card';
import { useAuthStore } from '@/store/authStore';

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const toast = useToast();
  const { stats, setJobs, jobs: allJobs, activeFilter } = useDashboardStore();
  const { data: jobsData, isLoading, error } = useJobs();

  useEffect(() => {
    if (jobsData) {
      setJobs(jobsData);
    }
  }, [jobsData, setJobs]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch jobs');
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const totalJobs = allJobs.length;
  const completionRate = totalJobs
    ? Math.round((stats.completedJobs / totalJobs) * 100)
    : 0;

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  return (
    <div className="animate-fadeIn space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-foreground">
  Hello, {(user?.first_name?.charAt(0).toUpperCase() + user?.first_name?.slice(1)) || 'User'}!
</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <p className="text-sm text-foreground font-medium">
          {today}
        </p>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Active filter: <span className="text-foreground">{JOB_STATUS_LABELS[activeFilter] || 'All Jobs'}</span>
        </p>
      </div>

      <StatsCards
        stats={stats}
        totalJobs={totalJobs}
        completionRate={completionRate}
        isInternal={user?.is_internal}
      />

      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
          <div>
            <h2 className="text-xl font-bold font-heading text-foreground">
              Job Queue
            </h2>
            <p className="text-sm text-muted-foreground">
              Focus your next actions by status and due date.
            </p>
          </div>
          <div className="bg-secondary px-3 py-1 rounded-full border border-border/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="text-foreground mr-1">{totalJobs}</span> Total Jobs
            </p>
          </div>
        </div>

        <JobFilters />

        <Card className="border-border/60 shadow-sm bg-card/40">
          <CardContent className="p-6">
            <JobList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
