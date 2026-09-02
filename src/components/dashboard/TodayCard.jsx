import React from 'react';
import { Link } from 'react-router-dom';
import { Clock3, MapPin } from 'lucide-react';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import StatusBadge from '@components/common/StatusBadge';
import { useRoster } from '@hooks/useQueryHooks';
import { ROSTER_STATUS_LABEL, ROSTER_STATUS_TONE } from '@utils/status';

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// The backend already decides where the day stands (app/routes/roster.py::_entry_status).
// Each state gets one sentence and one primary action — never two competing CTAs.
const STATE_COPY = {
  blocked: {
    headline: 'Start the job to open attendance',
    body: 'Attendance and the checklist unlock once this job is started.',
    action: (entry) => ({ label: 'Open job', to: `/dashboard/jobs/${entry.job_id}` }),
  },
  scheduled: {
    headline: 'You are scheduled',
    body: (entry) => `Check-in opens shortly before ${entry.slot_start}.`,
    action: (entry) => ({ label: 'View job', to: `/dashboard/jobs/${entry.job_id}` }),
  },
  check_in_open: {
    headline: 'Check in now',
    body: 'Take your site photo to start the slot.',
    action: (entry) => ({ label: 'Check in', to: `/attendance?entry=${entry.id}` }),
  },
  checked_in: {
    headline: 'You are on site',
    body: 'Work through the checklist, then check out before the slot ends.',
    action: (entry) => ({ label: 'Open job', to: `/dashboard/jobs/${entry.job_id}` }),
    secondary: (entry) => ({ label: 'Check out', to: `/attendance?entry=${entry.id}` }),
  },
  report_due: {
    headline: 'Submit your daily report',
    body: 'The slot has ended. Generate the report, then check out.',
    action: () => ({ label: 'Daily report', to: '/daily-report' }),
    secondary: (entry) => ({ label: 'Check out', to: `/attendance?entry=${entry.id}` }),
  },
  completed: {
    headline: 'Day complete',
    body: 'Checked out and reported. Nothing else is due today.',
    action: (entry) => ({ label: 'View job', to: `/dashboard/jobs/${entry.job_id}` }),
  },
  auto_closed: {
    headline: 'Closed automatically',
    body: 'You were checked out by the system. Tell your supervisor if that is wrong.',
    action: (entry) => ({ label: 'View job', to: `/dashboard/jobs/${entry.job_id}` }),
  },
  missed: {
    headline: 'Slot missed',
    body: 'No check-in was recorded for this slot.',
    action: (entry) => ({ label: 'View job', to: `/dashboard/jobs/${entry.job_id}` }),
  },
};

// What needs the partner's attention first, not what happens to be earliest in the day.
const PRIORITY = ['check_in_open', 'report_due', 'checked_in', 'blocked', 'scheduled', 'missed', 'completed', 'auto_closed'];

const pickEntry = (entries) =>
  [...entries].sort(
    (a, b) => PRIORITY.indexOf(a.status) - PRIORITY.indexOf(b.status) || a.slot_number - b.slot_number,
  )[0];

const resolve = (value, entry) => (typeof value === 'function' ? value(entry) : value);

const TodayCard = () => {
  const today = todayISO();
  const { data = { entries: [] }, isLoading, error } = useRoster(today);
  const entries = data.entries || [];
  const entry = entries.length ? pickEntry(entries) : null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-56 animate-pulse rounded bg-muted" />
          <div className="mt-5 h-10 w-36 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // A roster outage must not hide the rest of the dashboard — stay quiet instead.
  if (error) return null;

  if (!entry) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-foreground">No assignment today</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your supervisor has not rostered you for a slot today. Your jobs are listed below.
          </p>
        </CardContent>
      </Card>
    );
  }

  const copy = STATE_COPY[entry.status] || STATE_COPY.scheduled;
  const action = resolve(copy.action, entry);
  const secondary = copy.secondary ? resolve(copy.secondary, entry) : null;
  const remaining = entries.length - 1;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
            <h2 className="mt-1 truncate text-lg font-bold text-foreground">{entry.job?.name}</h2>
          </div>
          <StatusBadge tone={ROSTER_STATUS_TONE[entry.status]}>
            {ROSTER_STATUS_LABEL[entry.status] || entry.status}
          </StatusBadge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Slot {entry.slot_number} · {entry.slot_start}–{entry.slot_end}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {entry.job?.service_location || entry.job?.customer_city || 'Location pending'}
            </span>
          </span>
        </div>

        <p className="text-sm text-foreground">
          <span className="font-semibold">{copy.headline}.</span>{' '}
          <span className="text-muted-foreground">{resolve(copy.body, entry)}</span>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to={action.to}>{action.label}</Link>
          </Button>
          {secondary && (
            <Button asChild variant="outline" size="lg">
              <Link to={secondary.to}>{secondary.label}</Link>
            </Button>
          )}
          {remaining > 0 && (
            <Link to="/roster" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              +{remaining} more slot{remaining === 1 ? '' : 's'} today
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayCard;
