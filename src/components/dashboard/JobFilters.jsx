import React from 'react';
import { JOB_STATUS, JOB_STATUS_LABELS } from '@utils/constants';
import { useDashboardStore } from '@store/dashboardStore';
import { Hourglass, Circle, CheckCircle2, PauseCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';

const JobFilters = () => {
  const { activeFilter, setActiveFilter, jobs } = useDashboardStore();

  const filters = [
    {
      status: JOB_STATUS.CREATED,
      label: JOB_STATUS_LABELS[JOB_STATUS.CREATED],
      icon: Hourglass,
    },
    {
      status: JOB_STATUS.IN_PROGRESS,
      label: JOB_STATUS_LABELS[JOB_STATUS.IN_PROGRESS],
      icon: Circle,
    },
    {
      status: JOB_STATUS.COMPLETED,
      label: JOB_STATUS_LABELS[JOB_STATUS.COMPLETED],
      icon: CheckCircle2,
    },
    {
      status: JOB_STATUS.PAUSED,
      label: JOB_STATUS_LABELS[JOB_STATUS.PAUSED],
      icon: PauseCircle,
    },
  ];

  const getJobCount = (status) => {
    return jobs.filter((job) => job.status === status).length;
  };

  return (
    <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
      <TabsList className="h-auto w-full justify-start overflow-x-auto p-1 bg-transparent gap-2 no-scrollbar">
        {filters.map((filter) => {
          const count = getJobCount(filter.status);
          const Icon = filter.icon;

          return (
            <TabsTrigger
              key={filter.status}
              value={filter.status}
              className="group flex items-center gap-2 px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=inactive]:border-border/60 data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground rounded-md transition-all shadow-sm"
            >
              <Icon className="h-4 w-4" />
              <span>{filter.label}</span>
              <span className="ml-1 rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default JobFilters;
