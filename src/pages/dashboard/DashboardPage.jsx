import React, { useEffect, useState } from 'react';
import StatsCards from '@components/dashboard/StatsCards';
import TodayCard from '@components/dashboard/TodayCard';
import JobFilters from '@components/dashboard/JobFilters';
import JobList from '@components/dashboard/JobList';
import Loader from '@components/common/Loader';
import { useDashboardStore } from '@store/dashboardStore';
import { useJobs } from '@hooks/useQueryHooks';
import { useToast } from '@hooks/useToast';
import { JOB_STATUS_LABELS } from '@utils/constants';
import { Card, CardContent } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Search } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { getApiErrorMessage } from '../../api/apiErrors';

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { stats, setJobs, jobs: allJobs, activeFilter } = useDashboardStore();
  const { data: jobsData, isLoading, error, refetch } = useJobs();

  useEffect(() => {
    if (jobsData) {
      setJobs(jobsData);
    }
  }, [jobsData, setJobs]);

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error));
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error && allJobs.length === 0) {
    return (
      <Card className="mx-auto max-w-lg border-destructive/30">
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
        </CardContent>
      </Card>
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

      <TodayCard />

      {error ? (
        <Card className="border-warning/30 bg-warning/10"><CardContent role="alert" className="p-4 text-sm text-warning">Showing saved jobs. {getApiErrorMessage(error)}</CardContent></Card>
      ) : null}

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
          <StatusBadge>{totalJobs} total jobs</StatusBadge>
        </div>

        <JobFilters />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search jobs by name, customer, city or ID..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10"
          />
        </div>

        <Card className="border-border/60 shadow-sm bg-card/40">
          <CardContent className="p-6">
            <JobList searchTerm={searchTerm} />
          </CardContent>
        </Card>
      </div>

      <StatsCards
        stats={stats}
        totalJobs={totalJobs}
        completionRate={completionRate}
        isInternal={user?.is_internal}
      />
    </div>
  );
};

export default DashboardPage;
