// components/Checklist/ChecklistStats.jsx
import React from 'react';
import useChecklistStore from '../../store/checklistStore';
import {
  CheckCircleIcon,
  ClockIcon,
  CheckBadgeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ChecklistStats = () => {
  const stats = useChecklistStore(state => state.stats);
  console.log('ChecklistStats - stats:', stats);

  const statCards = [
    {
      label: 'Total Items',
      value: stats.totalItems,
      icon: ChartBarIcon,
      color: 'text-muted-foreground',
      bgColor: 'bg-secondary',
    },
    {
      label: 'Checked',
      value: stats.checkedCount,
      icon: CheckCircleIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Under Review',
      value: stats.pendingCount,
      icon: ClockIcon,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Approved',
      value: stats.approvedCount,
      icon: CheckBadgeIcon,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="mt-6">
      {/* Progress Bar */}
      <div className="ds-card p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">Overall Progress</h3>
          <span className="text-sm font-semibold text-foreground">
            {stats.completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {stats.approvedCount} of {stats.totalItems} items completed
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="ds-card p-6 ds-card-hoverable"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistStats;