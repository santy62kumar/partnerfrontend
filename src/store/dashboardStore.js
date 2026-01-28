import { create } from 'zustand';
import { JOB_STATUS } from '@utils/constants';

export const useDashboardStore = create((set, get) => ({
  // State
  jobs: [],
  selectedJob: null,
  activeFilter: JOB_STATUS.IN_PROGRESS,
  
  stats: {
    completedJobs: 0,
    inProgressJobs: 0,
    totalEarnings: 0,
    totalIncentives: 0,
  },

  loading: false,
  error: null,

  // Actions
  setJobs: (jobs) => {
    set({ jobs });
    // Calculate stats when jobs are set
    get().calculateStats();
  },

  setSelectedJob: (job) => set({ selectedJob: job }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // Calculate statistics from jobs
  calculateStats: () => {
    const { jobs } = get();
    
    const createdJobs = jobs.filter(
      (job) => job.status === JOB_STATUS.CREATED
    ).length;
    
    const completedJobs = jobs.filter(
      (job) => job.status === JOB_STATUS.COMPLETED
    ).length;
    
    const inProgressJobs = jobs.filter(
      (job) => job.status === JOB_STATUS.IN_PROGRESS
    ).length;
    
    const totalEarnings = jobs
      .filter((job) => job.status === JOB_STATUS.COMPLETED)
      .reduce((sum, job) => sum + (job.rate || 0), 0);
    
    const totalIncentives = jobs
      .reduce((sum, job) => sum + (job.incentive || 0), 0);

    set({
      stats: {
        completedJobs,
        inProgressJobs,
        totalEarnings,
        totalIncentives,
      },
    });
  },

  // Update a single job in the list
  updateJob: (jobId, updatedData) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, ...updatedData } : job
      ),
    }));
    get().calculateStats();
  },

  // Add job progress to selected job
  addJobProgress: (progress) => {
    set((state) => ({
      selectedJob: state.selectedJob
        ? {
            ...state.selectedJob,
            progress: [...(state.selectedJob.progress || []), progress],
          }
        : null,
    }));
  },

  // Clear selected job
  clearSelectedJob: () => set({ selectedJob: null }),

  // Reset dashboard
  resetDashboard: () => set({
    jobs: [],
    selectedJob: null,
    activeFilter: JOB_STATUS.IN_PROGRESS,
    stats: {
      completedJobs: 0,
      inProgressJobs: 0,
      totalEarnings: 0,
      totalIncentives: 0,
    },
    loading: false,
    error: null,
  }),

  // Getters
  getFilteredJobs: () => {
    const { jobs, activeFilter } = get();
    return jobs.filter((job) => job.status === activeFilter);
  },

  getJobById: (jobId) => {
    const { jobs } = get();
    return jobs.find((job) => job.id === parseInt(jobId));
  },

  getStats: () => get().stats,
}));