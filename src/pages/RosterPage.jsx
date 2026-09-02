import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react';
import { useRoster } from '@hooks/useQueryHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import StatusBadge from '@components/common/StatusBadge';
import { ROSTER_STATUS_LABEL, ROSTER_STATUS_TONE } from '@utils/status';

const toIso = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
const fromIso = (value) => new Date(`${value}T00:00:00`);
const addDays = (value, days) => {
  const date = fromIso(value);
  date.setDate(date.getDate() + days);
  return toIso(date);
};
const formatDay = (value) => fromIso(value).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function RosterPage() {
  const today = toIso(new Date());
  const [weekStart, setWeekStart] = useState(today);
  const weekEnd = addDays(weekStart, 6);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const { data = { slots: [], entries: [] }, isLoading, isFetching, error, refetch } = useRoster(weekStart, weekEnd);
  const hasAssignments = data.entries.length > 0;
  const hasRosterData = data.slots.length > 0 || hasAssignments;
  const partial = data.slots.length !== 2 || (error && hasRosterData);
  const fatalError = error && !hasRosterData;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" /></div>
          <h1 className="text-2xl font-semibold tracking-tight">My roster</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatDay(weekStart)} – {formatDay(weekEnd)} · Daily assignments and attendance status.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft /></Button>
          <Button variant="outline" onClick={() => setWeekStart(today)} disabled={weekStart === today}>Today</Button>
          <Button variant="outline" size="icon" aria-label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight /></Button>
        </div>
      </div>

      {isLoading ? <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading roster…</CardContent></Card> : null}
      {fatalError ? <Card><CardContent className="space-y-3 py-10 text-center"><p className="font-semibold text-destructive">Roster unavailable</p><p className="text-sm text-muted-foreground">{error.message}</p><Button variant="outline" onClick={() => refetch()} disabled={isFetching}>{isFetching ? 'Retrying…' : 'Retry'}</Button></CardContent></Card> : null}

      {!isLoading && !fatalError && partial ? <Card className="border-warning/40 bg-warning/10"><CardContent className="py-4 text-sm text-warning">{error?.message || 'Roster hours are incomplete. Assignment times are shown where available.'}</CardContent></Card> : null}

      {!isLoading && !fatalError && !hasAssignments ? <Card><CardContent className="py-12 text-center"><p className="font-semibold text-foreground">No assignments this week</p><p className="mt-1 text-sm text-muted-foreground">Use the week controls to review another date range.</p></CardContent></Card> : null}

      {!isLoading && !fatalError && hasAssignments ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {days.map((day) => {
            const entries = data.entries.filter((entry) => entry.work_date === day);
            return (
              <Card key={day} className={day === today ? 'border-primary/50 shadow-sm' : ''}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    {formatDay(day)}
                    {day === today ? <Badge variant="outline">Today</Badge> : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2].map((slotNumber) => {
                    const slot = data.slots.find((item) => item.slot_number === slotNumber);
                    const entry = entries.find((item) => item.slot_number === slotNumber);
                    return (
                      <div key={slotNumber} className="min-h-32 rounded-lg border bg-background p-3">
                        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold uppercase tracking-wide">Slot {slotNumber}</span>
                          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{entry?.slot_start && entry?.slot_end ? `${entry.slot_start}–${entry.slot_end}` : slot ? `${slot.start_time}–${slot.end_time}` : 'Time pending'}</span>
                        </div>
                        {entry ? (
                          <div className="space-y-2 border-l-2 border-primary pl-3">
                            <p className="font-semibold text-foreground">{entry.job?.name || 'Job details unavailable'}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{entry.job?.customer_city || 'Location pending'}</p>
                            <StatusBadge tone={ROSTER_STATUS_TONE[entry.status]} className="text-xs">{ROSTER_STATUS_LABEL[entry.status] || entry.status}</StatusBadge>
                            {entry.status === 'blocked' ? <p className="text-xs text-muted-foreground">Attendance opens once this job is started — you can start it from the job page.</p> : null}
                          </div>
                        ) : <p className="pt-4 text-center text-sm text-muted-foreground">No assignment</p>}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
