import { generateDailyReport as generateDailyReportRequest } from './dailyReportGeneratedApi';
import { getJobsPage } from './jobsGeneratedApi';
import * as generated from './dashboardGeneratedApi';

const extractJob = (payload) => payload?.job || payload?.data || payload || null;

export const dashboardApi = {
  // Get all jobs
  getJobs: async () => {
    const jobs = [];
    const limit = 100;
    let result;
    for (let page = 0; page < 100; page += 1) {
      result = await getJobsPage(jobs.length, limit);
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
      generated.getJob(jobId),
      generated.getJobChecklists(jobId).catch((error) => ({ checklists: [], _error: error })),
    ]);

    const job = extractJob(jobResponse);
    const checklists = checklistsResponse?.checklists || [];

    return {
      ...jobResponse,
      job: {
        ...job,
        checklists,
      },
      checklistsError: checklistsResponse?._error || null,
    };
  },

  requestStartOtp: generated.requestStartOtp,

  verifyStartOtp: (jobId, otp, notes) => generated.verifyStartOtp(jobId, { otp, notes }),

  startJob: (jobId, notes) => generated.startJob(jobId, { notes }),

  requestEndOtp: generated.requestEndOtp,

  verifyEndOtp: (jobId, otp, notes, documents = {}) => generated.verifyEndOtp(jobId, { otp, notes, ...documents }),

  finishJob: (jobId, notes, documents = {}) => generated.finishJob(jobId, { notes, ...documents }),

  uploadCompletionDocument: generated.uploadCompletionDocument,

  recordAttendance: async ({ jobId, rosterEntryId, latitude, longitude, manualLocation, photoFile, attendanceType, reportFile, sundayReason }) => {
    return generated.recordAttendance({
      job_id: jobId || null,
      roster_entry_id: rosterEntryId || null,
      latitude,
      longitude,
      manual_location: manualLocation?.trim() || '',
      attendance_type: attendanceType || 'check_in',
      photo: photoFile,
      report_file: reportFile || null,
      sunday_reason: sundayReason || null,
    });
  },

  getAttendance: generated.getAttendance,

  getJobChecklists: async (jobId) => (await generated.getJobChecklists(jobId))?.checklists || [],

  // Standalone report generation: returns the PDF, writes nothing.
  generateDailyReport: async ({ jobId, manualJob, reportDate, reportData, progressPhotos = [] }) => {
    const response = await generateDailyReportRequest({ jobId, manualJob, reportDate, reportData, progressPhotos });
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

  getSundayRequests: generated.getSundayRequests,

  createSundayRequest: ({ requestDate, reason }) => generated.createSundayRequest(requestDate, reason),

  getBilling: generated.getBilling,

  requestInvoice: generated.requestInvoice,

  requestAdditionalInvoice: generated.requestAdditionalInvoice,

  downloadInvoice: async (jobId, jobName, invoiceRequestId) => {
    const blob = await generated.downloadInvoice(jobId, invoiceRequestId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `billing_invoice_${jobName || jobId}_${invoiceRequestId || 'latest'}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  },
};
