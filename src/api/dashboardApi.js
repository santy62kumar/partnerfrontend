import apiClient from './axiosConfig';

const extractJob = (payload) => payload?.job || payload?.data || payload || null;

export const dashboardApi = {
  // Get all jobs
  getJobs: async () => {
    const jobs = [];
    const limit = 100;
    let result;
    for (let page = 0; page < 100; page += 1) {
      const response = await apiClient.get('/dashboard/jobs', {
        params: { skip: jobs.length, limit },
      });
      result = response.data;
      const nextJobs = result.jobs || [];
      jobs.push(...nextJobs);
      if (nextJobs.length < limit) {
        return { ...result, total: jobs.length, skip: 0, limit: jobs.length, jobs };
      }
    }
    throw new Error('Could not load all jobs. Contact support if more than 10,000 jobs are assigned.');
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

  getJobHistory: async (jobId) => {
    const response = await apiClient.get(`/dashboard/jobs/${jobId}/history`);
    return response.data;
  },

  addJobNote: async (jobId, notes) => {
    const response = await apiClient.post(`/dashboard/jobs/${jobId}/notes`, { notes: notes.trim() });
    return response.data;
  },

  recordAttendance: async ({ jobId, latitude, longitude, manualLocation, photoFile, attendanceType, reportFile, sundayReason }) => {
    const formData = new FormData();
    if (jobId) formData.append('job_id', String(jobId));
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('manual_location', manualLocation?.trim() || '');
    formData.append('attendance_type', attendanceType || 'check_in');
    formData.append('photo', photoFile, photoFile?.name || `attendance-${Date.now()}.jpg`);
    if (reportFile) formData.append('report_file', reportFile, reportFile.name);
    // Only read when the day turns out to need superadmin approval.
    if (sundayReason) formData.append('sunday_reason', sundayReason);
    const response = await apiClient.post('/dashboard/attendance', formData);
    return response.data;
  },

  getAttendance: async () => {
    const response = await apiClient.get('/dashboard/attendance');
    return response.data;
  },

  // Standalone report generation: returns the PDF, writes nothing.
  generateDailyReport: async ({ jobId, manualJob, reportDate, reportData, progressPhotos = [] }) => {
    const formData = new FormData();
    formData.append('report_date', reportDate);
    formData.append('report_data', JSON.stringify(reportData));
    if (jobId === 'manual') {
      formData.append('project_name', manualJob.projectName.trim());
      formData.append('sales_order', manualJob.salesOrder.trim());
      formData.append('project_supervisor', manualJob.projectSupervisor.trim());
      formData.append('site_address', manualJob.siteAddress.trim());
    }
    progressPhotos.forEach((file) => formData.append('progress_photos', file, file.name));
    const response = await apiClient.post(`/dashboard/jobs/${jobId}/daily-report`, formData, {
      responseType: 'blob',
    });
    const disposition = String(response.headers?.['content-disposition'] || '');
    const filename = disposition.match(/filename="?([^";]+)/i)?.[1]
      || 'daily-installation-report.pdf';
    const url = globalThis.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => globalThis.URL.revokeObjectURL(url), 10000);
  },

  getSundayRequests: async () => {
    const response = await apiClient.get('/dashboard/sunday-requests');
    return response.data;
  },

  createSundayRequest: async ({ requestDate, reason }) => {
    const response = await apiClient.post('/dashboard/sunday-requests', {
      request_date: requestDate,
      reason: reason?.trim() || null,
    });
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

  downloadInvoice: async (jobId, jobName, invoiceRequestId) => {
    const path = invoiceRequestId
      ? `/dashboard/jobs/${jobId}/invoice-requests/${invoiceRequestId}/download`
      : `/dashboard/jobs/${jobId}/invoice-request/download`;
    const response = await apiClient.get(path, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `billing_invoice_${jobName || jobId}_${invoiceRequestId || 'latest'}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  },
};
