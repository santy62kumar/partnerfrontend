import apiClient from './axiosConfig';

const extractJob = (payload) => payload?.job || payload?.data || payload || null;

export const dashboardApi = {
  // Get all jobs
  getJobs: async () => {
    const response = await apiClient.get('/dashboard/jobs');
    return response.data;
  },

  // Get single job details + checklist metadata for detail page
  getJob: async (jobId) => {
    const [jobResponse, checklistsResponse] = await Promise.all([
      apiClient.get(`/dashboard/jobs/${jobId}`),
      apiClient.get(`/dashboard/jobs/${jobId}/checklists`).catch(() => ({ data: { checklists: [] } })),
    ]);

    const job = extractJob(jobResponse.data);
    const checklists = checklistsResponse?.data?.checklists || [];

    return {
      ...jobResponse.data,
      job: {
        ...job,
        checklists,
      },
    };
  },

  // Upload job progress (file only supported by backend)
  uploadProgress: async (jobId, file, comment) => {
    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    }

    if (comment) {
      formData.append('comment', comment);
    }

    const response = await apiClient.post(
      `/dashboard/jobs/${jobId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get job progress history
  getJobProgress: async (jobId) => {
    const response = await apiClient.get(`/dashboard/jobs/${jobId}/progress`);
    return response.data;
  },
};
