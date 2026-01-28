import React from 'react';
import { JOB_STATUS, JOB_STATUS_LABELS } from '@utils/constants';
import { useDashboardStore } from '@store/dashboardStore';

/**
 * Job Filters Component
 * Filter buttons for job status (in-progress, completed, paused)
 */
const JobFilters = () => {
  const { activeFilter, setActiveFilter, jobs } = useDashboardStore();

  const filters = [

    {
      status: JOB_STATUS.CREATED,
      label: JOB_STATUS_LABELS[JOB_STATUS.CREATED],
    },
    {
      status: JOB_STATUS.IN_PROGRESS,
      label: JOB_STATUS_LABELS[JOB_STATUS.IN_PROGRESS],
    },
    {
      status: JOB_STATUS.COMPLETED,
      label: JOB_STATUS_LABELS[JOB_STATUS.COMPLETED],
    },
    {
      status: JOB_STATUS.PAUSED,
      label: JOB_STATUS_LABELS[JOB_STATUS.PAUSED],
    },
  ];

  const getJobCount = (status) => {
    return jobs.filter((job) => job.status === status).length;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.status;
        const count = getJobCount(filter.status);

        return (
          <button
            key={filter.status}
            onClick={() => setActiveFilter(filter.status)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all
              flex items-center gap-2
              ${
                isActive
                  ? 'bg-[#3D1D1C] text-white shadow-md'
                  : 'bg-white text-primary-grey-700 hover:bg-primary-grey-100 border border-primary-grey-300'
              }
            `}
          >
            <span>{filter.label}</span>
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-primary-grey-200 text-primary-grey-700'
                }
              `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default JobFilters;