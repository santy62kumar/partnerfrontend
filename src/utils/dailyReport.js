// Daily Installation Report shape and formatting, shared by the check-out flow
// and the standalone generator page, so the two can't drift out of agreement
// with app/schemas/attendance.py.

export const MAX_PROGRESS_PHOTOS = 12;
export const MAX_PROGRESS_PHOTO_BYTES = 2 * 1024 * 1024;
export const MAX_REPORT_ROWS = 3;

// Field limits mirror app/schemas/attendance.py — enforced here so an over-long
// entry is stopped as it is typed, not with a 422 after the photo and GPS.
export const LIMITS = { action: 500, notes: 1000, short: 20 };

export const addDaysISO = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// <input type="date"> speaks YYYY-MM-DD; the report itself prints DD/MM/YYYY
// (installation_report_service), so convert at the boundary and keep one format
// in the finished document.
export const toReportDate = (iso) => {
  const [y, m, d] = String(iso || '').split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso || '';
};

// Dates default to today for work done and tomorrow for what is next, which is
// what these rows almost always mean.
export const emptyProgressRow = () => ({ action_item: '', date: addDaysISO(0), challenges_faced: '' });
export const emptyUpcomingRow = () => ({ action_item: '', date: addDaysISO(1), potential_issues: '' });

export const addReportRow = (rows, row) => rows.length < MAX_REPORT_ROWS ? [...rows, row] : rows;

export const emptyReport = () => ({
  accomplishments: [''],
  completed_work: [emptyProgressRow()],
  num_ips: '', ip_in_time: '', ip_out_time: '',
  num_helpers: '', helper_in_time: '', helper_out_time: '',
  num_labour: '', labour_in_time: '', labour_out_time: '', mandays: '',
  upcoming_work: [emptyUpcomingRow()],
});

/** Strip the blank rows and put dates in the report's format. */
export const normalizeReport = (reportData) => ({
  ...reportData,
  accomplishments: reportData.accomplishments.filter((value) => value.trim()),
  // Keyed on action_item, not "any field set" — the date is prefilled, so
  // `some()` would send three empty rows every time.
  completed_work: reportData.completed_work
    .filter((row) => row.action_item.trim())
    .map((row) => ({ ...row, date: toReportDate(row.date) })),
  upcoming_work: reportData.upcoming_work
    .filter((row) => row.action_item.trim())
    .map((row) => ({ ...row, date: toReportDate(row.date) })),
});

export const hasAccomplishment = (reportData) =>
  reportData.accomplishments.some((value) => value.trim());
