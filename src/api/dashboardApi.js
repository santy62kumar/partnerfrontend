import apiClient from './axiosConfig';

export const dashboardApi = {
  // Get all jobs
  getJobs: async () => {
    const response = await apiClient.get('/dashboard/jobs');
    return response.data;
  },

  // Get single job details
  getJob: async (jobId) => {
    const response = await apiClient.get(`/dashboard/jobs/${jobId}`);
    return response.data;
  },

  // Upload job progress (file and/or comment)
  uploadProgress: async (jobId, file, comment) => {
    const formData = new FormData();
    formData.append('job_id', jobId);
    
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