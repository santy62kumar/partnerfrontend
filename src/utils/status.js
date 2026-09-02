// Job and roster states, their tone and their wording — the single source both the
// job cards and the day view read from.
export const JOB_STATUS_TONE = {
  created: 'neutral',
  pending_approval: 'warning',
  creation_rejected: 'danger',
  in_progress: 'info',
  paused: 'warning',
  completed: 'success',
};

export const ROSTER_STATUS_TONE = {
  blocked: 'neutral',
  scheduled: 'info',
  check_in_open: 'warning',
  checked_in: 'info',
  report_due: 'warning',
  completed: 'success',
  auto_closed: 'neutral',
  missed: 'danger',
};

export const ROSTER_STATUS_LABEL = {
  blocked: 'Not started',
  scheduled: 'Scheduled',
  check_in_open: 'Check-in open',
  checked_in: 'On site',
  report_due: 'Report due',
  completed: 'Completed',
  auto_closed: 'Auto closed',
  missed: 'Missed',
};

export const statusLabel = (status) => (status || '').replaceAll('_', ' ');
