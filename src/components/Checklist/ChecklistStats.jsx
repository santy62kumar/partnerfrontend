// components/Checklist/ChecklistStats.jsx
import React from 'react';
import useChecklistStore from '../../store/checklistStore';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  CheckBadgeIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

/**
 * Checklist Statistics Component
 * 
 * Displays aggregate statistics about checklist completion
 */

const ChecklistStats = () => {
  const stats = useChecklistStore(state => state.stats);

  const statCards = [
    {
      label: 'Total Items',
      value: stats.totalItems,
      icon: ChartBarIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Checked',
      value: stats.checkedCount,
      icon: CheckCircleIcon,
      color: 'text-[#3D1D1C]',
      bgColor: 'bg-[#3D1D1C]/10',
    },
    {
      label: 'Pending',
      value: stats.pendingCount,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Approved',
      value: stats.approvedCount,
      icon: CheckBadgeIcon,
      color: 'text-[#3D1D1C]',
      bgColor: 'bg-[#3D1D1C]/10',
    },
  ];

  return (
    <div className="mt-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
          <span className="text-sm font-semibold text-gray-900">
            {stats.completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#3D1D1C] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.checkedCount} of {stats.totalItems} items completed
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
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