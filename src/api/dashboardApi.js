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

  recordAttendance: async ({ latitude, longitude, manualLocation, photoFile }) => {
    const formData = new FormData();
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('manual_location', manualLocation?.trim() || '');
    formData.append('photo', photoFile, photoFile?.name || `attendance-${Date.now()}.jpg`);
    const response = await apiClient.post('/dashboard/attendance', formData);
    return response.data;
  },

  getAttendance: async () => {
    const response = await apiClient.get('/dashboard/attendance');
    return response.data;
  },

  getBilling: async (jobId) => {
    const response = await apiClient.get(`/dashboard/jobs/${jobId}/billing`);
    return response.data;
  },

  requestInvoice: async (jobId) => {
    const response = await apiClient.post(`/dashboard/jobs/${jobId}/invoice-request`);
    return response.data;
  },

  requestAdditionalInvoice: async (jobId, data = {}) => {
    const response = await apiClient.post(`/dashboard/jobs/${jobId}/invoice-requests`, data);
    return response.data;
  },

  downloadInvoice: async (jobId, jobName) => {
    const response = await apiClient.get(`/dashboard/jobs/${jobId}/invoice-request/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `billing_invoice_${jobName || jobId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  },
};
