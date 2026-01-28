import React from 'react';
import Card from '@components/common/Card';
import { formatters } from '@utils/formatters';
import { JOB_STATUS_COLORS } from '@utils/constants';
import {
  IoPersonOutline,
  IoReaderOutline,
  IoLocationOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoResizeOutline,
} from 'react-icons/io5';

/**
 * Job Details Component
 * Shows detailed information about a specific job
 */
const JobDetails = ({ job }) => {
  const details = [
    // {
    //   label: 'Customer Name',
    //   value: job.customer_name || 'N/A',
    //   icon: IoPersonOutline,
    // },
    {
      label: 'Job Type',
      value: job.type || 'N/A',
      icon: IoReaderOutline,
    },
    // {
    //   label: 'Address',
    //   value: job.address,
    //   icon: IoLocationOutline,
    // },
    {
  label: 'Address',
  value: (
    <div
      className="line-clamp-3 break-words cursor-pointer hover:text-[#3D1D1C]/600"
      title={job.address}
      onClick={() => navigator.clipboard.writeText(job.address)}
    >
      {job.address}
    </div>
  ),
  icon: IoLocationOutline,
},
    {
      label: 'Pincode',
      value: job.pincode,
      icon: IoLocationOutline,
    },
    // {
    //   label: 'City',
    //   value: job.city,
    //   icon: IoLocationOutline,
    // },
    {
      label: 'Size',
      value: job.size || 'N/A',
      icon: IoResizeOutline,
    },
    {
      label: 'Rate',
      value: formatters.currency(job.rate),
      icon: IoCashOutline,
    },
    {
      label: 'Google Map Link',
      value: (
        <a
          href={job.google_map_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {job.google_map_link}
        </a>
      ),
      icon: IoLocationOutline,
    },
    {
      label: 'Start Date',
      value: formatters.date(job.start_date),
      icon: IoCalendarOutline,
    },
    {
      label: 'Delivery Date',
      value: formatters.date(job.delivery_date),
      icon: IoCalendarOutline,
    },
  ];

  return (
    <Card title="Job Information">
      <div className="space-y-4">
        {/* Job Name and Status */}
        <div className="pb-4 border-b border-primary-grey-200">
          <h3 className="text-xl font-bold font-montserrat text-primary-grey-900 mb-2">
            {job.name}
          </h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              JOB_STATUS_COLORS[job.status]
            }`}
          >
            {job.status}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {details.map((detail, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-primary-grey-50 rounded-lg"
            >
              <div className="p-2 bg-white rounded-lg">
                <detail.icon size={20} className="text-primary-grey-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-grey-500 mb-1">
                  {detail.label}
                </p>
                <p className="text-sm font-medium text-primary-grey-900 truncate">
                  {detail.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Description if available */}
        {job.description && (
          <div className="pt-4 border-t border-primary-grey-200">
            <h4 className="text-sm font-medium text-primary-grey-700 mb-2">
              Description
            </h4>
            <p className="text-sm text-primary-grey-600 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default JobDetails;