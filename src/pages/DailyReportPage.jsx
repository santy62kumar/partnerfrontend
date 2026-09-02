// Generate the Daily Installation Report on its own, without marking attendance.
// Nothing is stored: the PDF comes straight back as a download. Check-out still
// generates and files its own copy against that day's attendance record.
import React, { useState } from "react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import DailyReportForm from "@components/dashboard/DailyReportForm";
import { useJobs } from "@hooks/useQueryHooks";
import { useProgressPhotos } from "@hooks/useProgressPhotos";
import { useToast } from "@hooks/useToast";
import { dashboardApi } from "@api/dashboardApi";
import {
  addDaysISO,
  emptyReport,
  hasAccomplishment,
  normalizeReport,
} from "@utils/dailyReport";
import { IoDocumentTextOutline } from "react-icons/io5";
import { getApiErrorMessage, getApiFieldErrors } from "@api/apiErrors";

const DailyReportPage = () => {
  const toast = useToast();
  const {
    data: jobs = [],
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useJobs();
  const [jobId, setJobId] = useState("");
  const [manualJob, setManualJob] = useState({
    projectName: "",
    salesOrder: "",
    projectSupervisor: "",
    siteAddress: "",
  });
  const [reportDate, setReportDate] = useState(addDaysISO(0));
  const [reportData, setReportData] = useState(emptyReport);
  const [generating, setGenerating] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const progressPhotos = useProgressPhotos();
  const updateManual = (field, apiField) => (event) => {
    setManualJob((current) => ({ ...current, [field]: event.target.value }));
    setServerErrors((current) => ({ ...current, [apiField]: "" }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!jobId) {
      toast.error("Select the job this report is for");
      return;
    }
    if (jobId === "manual" && !manualJob.projectName.trim()) {
      toast.error("Enter the project name for the manual job");
      return;
    }
    if (!hasAccomplishment(reportData)) {
      toast.error("Add at least one key accomplishment to the daily report");
      return;
    }

    setGenerating(true);
    setServerErrors({});
    try {
      await dashboardApi.generateDailyReport({
        jobId,
        manualJob,
        reportDate,
        reportData: normalizeReport(reportData),
        progressPhotos: progressPhotos.files,
      });
      toast.success("Daily Installation Report downloaded");
    } catch (err) {
      setServerErrors(getApiFieldErrors(err));
      toast.error(getApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card title="Daily Installation Report">
      <form onSubmit={handleGenerate} className="space-y-4">
        {jobsError && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 p-3">
            <p className="flex-1 text-sm text-destructive">
              {jobsError.message}
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => refetchJobs()}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Job <span className="text-destructive">*</span>
            </span>
            <select
              value={jobId}
              onChange={(event) => { setJobId(event.target.value); setServerErrors((current) => ({ ...current, job_id: "" })); }}
              required
              disabled={jobsLoading}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">
                {jobsLoading
                  ? "Loading dashboard jobs…"
                  : "Select dashboard job"}
              </option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name || `Job ${job.id}`} &middot; ID {job.id}
                </option>
              ))}
              <option value="manual">
                Job not listed — enter details manually
              </option>
            </select>
            {serverErrors.job_id ? <span role="alert" className="text-xs text-destructive">{serverErrors.job_id}</span> : null}
            {!jobsLoading && jobs.length === 0 && !jobsError ? <span className="text-xs text-muted-foreground">No assigned jobs. Use the manual option below.</span> : null}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Report date <span className="text-destructive">*</span>
            </span>
            <input
              type="date"
              value={reportDate}
              max={addDaysISO(0)}
              onChange={(event) => { setReportDate(event.target.value); setServerErrors((current) => ({ ...current, report_date: "" })); }}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
            {serverErrors.report_date ? <span role="alert" className="text-xs text-destructive">{serverErrors.report_date}</span> : null}
          </label>
        </div>

        {jobId === "manual" && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Manual job details
              </p>
              <p className="text-xs text-muted-foreground">
                Used only in this PDF; this does not create a dashboard job.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Project name *
                </span>
                <input
                  value={manualJob.projectName}
                  maxLength={255}
                  required
                  onChange={updateManual("projectName", "project_name")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                {serverErrors.project_name ? <span role="alert" className="text-xs text-destructive">{serverErrors.project_name}</span> : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Sales order
                </span>
                <input
                  value={manualJob.salesOrder}
                  maxLength={100}
                  onChange={updateManual("salesOrder", "sales_order")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                {serverErrors.sales_order ? <span role="alert" className="text-xs text-destructive">{serverErrors.sales_order}</span> : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Project supervisor
                </span>
                <input
                  value={manualJob.projectSupervisor}
                  maxLength={255}
                  placeholder="Defaults to your profile"
                  onChange={updateManual("projectSupervisor", "project_supervisor")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                {serverErrors.project_supervisor ? <span role="alert" className="text-xs text-destructive">{serverErrors.project_supervisor}</span> : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Site address
                </span>
                <textarea
                  rows={2}
                  value={manualJob.siteAddress}
                  maxLength={1000}
                  onChange={updateManual("siteAddress", "site_address")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                {serverErrors.site_address ? <span role="alert" className="text-xs text-destructive">{serverErrors.site_address}</span> : null}
              </label>
            </div>
          </div>
        )}

        <DailyReportForm
          reportData={reportData}
          setReportData={setReportData}
          progressPhotos={progressPhotos.photos}
          onAddPhotos={progressPhotos.add}
          onRemovePhoto={progressPhotos.remove}
        />
        {serverErrors.report_data ? <p role="alert" className="text-sm text-destructive">{serverErrors.report_data}</p> : null}
        {serverErrors.progress_photos ? <p role="alert" className="text-sm text-destructive">{serverErrors.progress_photos}</p> : null}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={generating}
          loadingLabel="Generating…"
        >
          <IoDocumentTextOutline size={16} />
          Generate and download PDF
        </Button>
      </form>
    </Card>
  );
};

export default DailyReportPage;
