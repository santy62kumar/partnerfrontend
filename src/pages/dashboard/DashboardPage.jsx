import React, { useEffect, useState } from 'react';
import StatsCards from '@components/dashboard/StatsCards';
import JobFilters from '@components/dashboard/JobFilters';
import JobList from '@components/dashboard/JobList';
import Loader from '@components/common/Loader';
import { useDashboardStore } from '@store/dashboardStore';
import { dashboardApi } from '@api/dashboardApi';
import { useToast } from '@hooks/useToast';

const DashboardPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  
  const { 
    stats, 
    setJobs, 
    setLoading: setStoreLoading,
    setError 
  } = useDashboardStore();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setStoreLoading(true);
    
    try {
      const response = await dashboardApi.getJobs();
      setJobs(response.jobs || response.data || []);
    } catch (error) {
      const message = error.message || 'Failed to fetch jobs';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="mb-6">
        {/* <h1 className="text-3xl font-bold font-montserrat text-primary-grey-900 mb-2">
          Dashboard
        </h1> */}
        <p className="text-primary-grey-600">
          Manage your jobs and track your progress
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Job Filters */}
      <JobFilters />

      {/* Job List */}
      <JobList />
    </div>
  );
};

export default DashboardPage;