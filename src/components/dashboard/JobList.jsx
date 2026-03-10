import React from 'react';
import JobCard from './JobCard';
import { useDashboardStore } from '@store/dashboardStore';
import { IoFolderOpenOutline } from 'react-icons/io5';
import { JOB_STATUS, JOB_STATUS_LABELS } from '@utils/constants';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';

const JobList = () => {
  const { getFilteredJobs, activeFilter, jobs, setActiveFilter } = useDashboardStore();
  const filteredJobs = getFilteredJobs();
  const activeFilterLabel = JOB_STATUS_LABELS[activeFilter] || 'Selected';

  if (filteredJobs.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-background/50">
        <CardContent className="p-12 text-center flex flex-col items-center">
          <IoFolderOpenOutline
            size={48}
            className="text-muted-foreground/50 mb-4"
          />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Jobs Found
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm">
            No jobs are currently marked as {activeFilterLabel.toLowerCase()}.
          </p>
          {activeFilter !== JOB_STATUS.IN_PROGRESS && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter(JOB_STATUS.IN_PROGRESS)}
            >
              Show In Progress Jobs
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-4 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Showing <span className="text-foreground">{filteredJobs.length}</span> of {jobs.length} jobs
        </p>
        <p className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full border border-border/50">
          {activeFilterLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </>
  );
};

export default JobList;
