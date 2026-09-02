import { generateDailyReportApiV1DashboardJobsJobIdDailyReportPost } from './generatedClient';

type ManualJob = {
  projectName: string;
  salesOrder: string;
  projectSupervisor: string;
  siteAddress: string;
};

export const generateDailyReport = async ({
  jobId,
  manualJob,
  reportDate,
  reportData,
  progressPhotos = [],
}: {
  jobId: string | number;
  manualJob: ManualJob;
  reportDate: string;
  reportData: unknown;
  progressPhotos?: File[];
}) => {
  const pathId = jobId === 'manual' ? 'manual' : Number(jobId);
  const response = await generateDailyReportApiV1DashboardJobsJobIdDailyReportPost({
    path: { job_id: pathId },
    body: {
      report_date: reportDate,
      report_data: JSON.stringify(reportData),
      ...(pathId === 'manual' ? {
        project_name: manualJob.projectName.trim(),
        sales_order: manualJob.salesOrder.trim(),
        project_supervisor: manualJob.projectSupervisor.trim(),
        site_address: manualJob.siteAddress.trim(),
      } : {}),
      progress_photos: progressPhotos,
    },
    responseType: 'blob',
    throwOnError: true,
  });
  return { data: response.data as Blob, headers: response.headers };
};
