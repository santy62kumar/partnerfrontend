import React from 'react';
import { useSearchParams } from 'react-router-dom';
import DailyAttendance from '@components/dashboard/DailyAttendance';

const AttendancePage = () => {
  // Arriving from the Today card, the slot is already known — don't ask again.
  const [params] = useSearchParams();

  return (
    <div className="animate-fadeIn space-y-6 max-w-6xl mx-auto">
      <DailyAttendance key={params.toString()} initialRosterEntryId={params.get('entry') || ''} initialJobId={params.get('job') || ''} />
    </div>
  );
};

export default AttendancePage;
