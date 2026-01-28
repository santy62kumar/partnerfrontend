import React from 'react';
import JobCard from './JobCard';
import { useDashboardStore } from '@store/dashboardStore';
import { IoFolderOpenOutline } from 'react-icons/io5';

/**
 * Job List Component
 * Displays filtered list of jobs
 */
const JobList = () => {
  const getFilteredJobs = useDashboardStore((state) => state.getFilteredJobs);
  const filteredJobs = getFilteredJobs();

  if (filteredJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-12 text-center">
        <IoFolderOpenOutline
          size={64}
          className="text-primary-grey-300 mx-auto mb-4"
        />
        <h3 className="text-xl font-semibold text-primary-grey-900 mb-2">
          No Jobs Found
        </h3>
        <p className="text-primary-grey-600">
          There are no jobs matching the selected filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};

export default JobList;