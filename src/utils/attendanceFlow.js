// A job spanning both halves of a day is one visit. The API records it on
// the first slot, including when a link points at the second slot.
export const collapseRosterVisits = (entries) => {
  const visits = new Map();
  for (const entry of entries) {
    const key = `${entry.work_date || ''}:${entry.job_id}`;
    const current = visits.get(key);
    const first = !current || entry.slot_number < current.slot_number ? entry : current;
    visits.set(key, {
      ...first,
      span_end: current && current.span_end > entry.slot_end ? current.span_end : entry.slot_end,
      span_slots: (current?.span_slots || 0) + 1,
      entry_ids: [...(current?.entry_ids || []), String(entry.id)],
    });
  }
  return [...visits.values()];
};

const PRIORITY = ['report_due', 'checked_in', 'check_in_open', 'blocked', 'scheduled', 'missed', 'completed', 'auto_closed'];
export const pickVisit = (visits, entryId = '', jobId = '') =>
  entryId || jobId
  ? visits.find((visit) => entryId ? visit.entry_ids.includes(String(entryId)) : String(visit.job_id) === String(jobId))
  : [...visits].sort((a, b) => {
    const rank = (status) => PRIORITY.includes(status) ? PRIORITY.indexOf(status) : PRIORITY.length;
    return rank(a.status) - rank(b.status) || a.slot_number - b.slot_number;
  })[0];

export const visitAttendanceType = (visit) =>
  ['checked_in', 'report_due'].includes(visit?.status) ? 'check_out' : 'check_in';

export const visitCanRecord = (visit) =>
  visit?.job?.status === 'in_progress' && ['check_in_open', 'checked_in', 'report_due'].includes(visit.status);
