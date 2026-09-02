// Daily Installation Report fields kept separate from the attendance shell so
// the camera, location, history, and report form remain readable.
import React, { useState } from 'react';
import { IoCloseCircleOutline } from 'react-icons/io5';
import {
  addReportRow,
  emptyProgressRow,
  emptyUpcomingRow,
  LIMITS,
  MAX_PROGRESS_PHOTOS,
  MAX_REPORT_ROWS,
} from '@utils/dailyReport';
import Button from '@components/common/Button';

const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground';

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </label>
);

const ReportSection = ({ title, children }) => (
  <div className="space-y-2">
    <p className="text-sm font-semibold text-foreground">{title}</p>
    {children}
  </div>
);

const MANPOWER_ROWS = [
  ['IPs', 'num_ips', 'ip_in_time', 'ip_out_time'],
  ['Helpers', 'num_helpers', 'helper_in_time', 'helper_out_time'],
  ['Labour', 'num_labour', 'labour_in_time', 'labour_out_time'],
];

const DailyReportForm = ({
  reportData,
  setReportData,
  progressPhotos,
  onAddPhotos,
  onRemovePhoto,
}) => {
  const [visibleManpowerRows, setVisibleManpowerRows] = useState(() =>
    MANPOWER_ROWS.reduce(
      (visible, [, ...fields], index) => fields.some((field) => reportData[field]) ? index + 1 : visible,
      1,
    )
  );

  return <>
    <ReportSection title="Key accomplishments">
      {reportData.accomplishments.map((value, index) => (
        <Field key={index} label={index === 0 ? 'Accomplishment 1 (required)' : `Accomplishment ${index + 1}`}>
          <input value={value} required={index === 0} maxLength={LIMITS.action}
            placeholder="What was achieved on site today"
            onChange={(event) => setReportData((current) => ({ ...current, accomplishments: current.accomplishments.map((item, i) => i === index ? event.target.value : item) }))}
            className={inputClass} />
        </Field>
      ))}
      {reportData.accomplishments.length < MAX_REPORT_ROWS && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setReportData((current) => ({
            ...current,
            accomplishments: addReportRow(current.accomplishments, ''),
          }))}
        >
          + Add accomplishment
        </Button>
      )}
    </ReportSection>

    <ReportSection title="Completed work">
      {reportData.completed_work.map((row, index) => (
        <div key={index} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
          <Field label={`Action item ${index + 1}`}>
            <input value={row.action_item} maxLength={LIMITS.action} placeholder="Work completed" onChange={(event) => setReportData((current) => ({ ...current, completed_work: current.completed_work.map((item, i) => i === index ? { ...item, action_item: event.target.value } : item) }))} className={inputClass} />
          </Field>
          <Field label="Date">
            <input type="date" value={row.date} onChange={(event) => setReportData((current) => ({ ...current, completed_work: current.completed_work.map((item, i) => i === index ? { ...item, date: event.target.value } : item) }))} className={inputClass} />
          </Field>
          <Field label="Challenges faced">
            <textarea rows={2} value={row.challenges_faced} maxLength={LIMITS.notes} placeholder="Blockers, delays, rework" onChange={(event) => setReportData((current) => ({ ...current, completed_work: current.completed_work.map((item, i) => i === index ? { ...item, challenges_faced: event.target.value } : item) }))} className={inputClass} />
          </Field>
        </div>
      ))}
      {reportData.completed_work.length < MAX_REPORT_ROWS && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setReportData((current) => ({
            ...current,
            completed_work: addReportRow(current.completed_work, emptyProgressRow()),
          }))}
        >
          + Add completed work
        </Button>
      )}
    </ReportSection>

    <ReportSection title="Manpower">
      {MANPOWER_ROWS.slice(0, visibleManpowerRows).map(([label, count, inTime, outTime]) => (
        <div key={label} className="rounded-lg border border-border p-3">
          <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Count">
              {/* text + inputMode, not type=number: maxLength is ignored on
                  number inputs, and the server caps these at 20 chars. */}
              <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={reportData[count]} maxLength={LIMITS.short} onChange={(event) => setReportData((current) => ({ ...current, [count]: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="In time">
              <input type="time" value={reportData[inTime]} onChange={(event) => setReportData((current) => ({ ...current, [inTime]: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Out time">
              <input type="time" value={reportData[outTime]} onChange={(event) => setReportData((current) => ({ ...current, [outTime]: event.target.value }))} className={inputClass} />
            </Field>
          </div>
        </div>
      ))}
      {visibleManpowerRows < MANPOWER_ROWS.length && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setVisibleManpowerRows((current) => current + 1)}
        >
          + Add manpower row
        </Button>
      )}
      <Field label="Mandays">
        <input type="text" inputMode="decimal" placeholder="0" value={reportData.mandays} maxLength={LIMITS.short} onChange={(event) => setReportData((current) => ({ ...current, mandays: event.target.value }))} className={inputClass} />
      </Field>
    </ReportSection>

    <ReportSection title="Upcoming work for next day">
      {reportData.upcoming_work.map((row, index) => (
        <div key={index} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
          <Field label={`Action item ${index + 1}`}>
            <input value={row.action_item} maxLength={LIMITS.action} placeholder="Work planned" onChange={(event) => setReportData((current) => ({ ...current, upcoming_work: current.upcoming_work.map((item, i) => i === index ? { ...item, action_item: event.target.value } : item) }))} className={inputClass} />
          </Field>
          <Field label="Date">
            <input type="date" value={row.date} onChange={(event) => setReportData((current) => ({ ...current, upcoming_work: current.upcoming_work.map((item, i) => i === index ? { ...item, date: event.target.value } : item) }))} className={inputClass} />
          </Field>
          <Field label="Potential issues">
            <textarea rows={2} value={row.potential_issues} maxLength={LIMITS.notes} placeholder="Risks, dependencies, material gaps" onChange={(event) => setReportData((current) => ({ ...current, upcoming_work: current.upcoming_work.map((item, i) => i === index ? { ...item, potential_issues: event.target.value } : item) }))} className={inputClass} />
          </Field>
        </div>
      ))}
      {reportData.upcoming_work.length < MAX_REPORT_ROWS && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setReportData((current) => ({
            ...current,
            upcoming_work: addReportRow(current.upcoming_work, emptyUpcomingRow()),
          }))}
        >
          + Add upcoming work
        </Button>
      )}
    </ReportSection>

    <ReportSection title={`Progress photos (${progressPhotos.length}/${MAX_PROGRESS_PHOTOS})`}>
      <p className="text-xs text-muted-foreground">Optional JPG or PNG images, maximum 2 MB each, are added after the generated report.</p>
      <input
        type="file"
        aria-label="Add progress photos"
        accept="image/jpeg,image/png"
        multiple
        disabled={progressPhotos.length >= MAX_PROGRESS_PHOTOS}
        onChange={onAddPhotos}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      {progressPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {progressPhotos.map(({ file, preview }, index) => (
            <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-lg border border-border">
              <img src={preview} alt={`Progress ${index + 1}`} className="h-28 w-full object-cover" />
              <Button
                type="button"
                variant="danger"
                size="sm"
                aria-label={`Remove progress photo ${index + 1}`}
                onClick={() => onRemovePhoto(index)}
                className="absolute right-1 top-1 rounded-full px-2"
              >
                <IoCloseCircleOutline size={20} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </ReportSection>
  </>
};

export default DailyReportForm;
