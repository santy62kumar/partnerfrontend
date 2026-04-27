import { create } from 'zustand';
import { JOB_STATUS } from '@utils/constants';

const JOBS_TTL = 90_000;
const JOB_DETAIL_TTL = 300_000;
const MAX_JOB_DETAIL_CACHE = 20;

export const useDashboardStore = create((set, get) => ({
  // State
  jobs: [],
  selectedJob: null,
  activeFilter: JOB_STATUS.IN_PROGRESS,
  lastFetched: null,
  jobDetailCache: {},

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
    set({ jobs, lastFetched: Date.now() });
    get().calculateStats();
  },

  isJobsStale: () => {
    const { lastFetched } = get();
    return !lastFetched || Date.now() - lastFetched > JOBS_TTL;
  },

  cacheJobDetail: (jobId, job, progress) => {
    set((state) => {
      const updated = { ...state.jobDetailCache, [jobId]: { job, progress, fetchedAt: Date.now() } };
      const entries = Object.entries(updated);
      if (entries.length > MAX_JOB_DETAIL_CACHE) {
        entries.sort((a, b) => a[1].fetchedAt - b[1].fetchedAt);
        entries.splice(0, entries.length - MAX_JOB_DETAIL_CACHE);
        return { jobDetailCache: Object.fromEntries(entries) };
      }
      return { jobDetailCache: updated };
    });
  },

  getJobDetailFromCache: (jobId) => {
    const { jobDetailCache } = get();
    const entry = jobDetailCache[jobId];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > JOB_DETAIL_TTL) return null;
    return entry;
  },

  setSelectedJob: (job) => set({ selectedJob: job }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // Calculate statistics from jobs
  calculateStats: () => {
    const { jobs } = get();
    
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
    return jobs.find((job) => job.id === Number.parseInt(jobId));
  },

  getStats: () => get().stats,
}));