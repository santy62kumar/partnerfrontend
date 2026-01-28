import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@components/common/Card';
import { formatters } from '@utils/formatters';
import { JOB_STATUS_COLORS } from '@utils/constants';
import { 
  IoLocationOutline, 
  IoCashOutline, 
  IoCalendarOutline,
  IoPersonOutline,
  IoReaderOutline
} from 'react-icons/io5';

/**
 * Job Card Component
 * Displays individual job information
 */
const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/jobs/${job.id}`);
  };

  return (
    <Card hoverable onClick={handleClick} className="cursor-pointer">
      <div className="space-y-3">
        {/* Job Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold font-montserrat text-primary-grey-900 mb-1">
              {job.name}
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                JOB_STATUS_COLORS[job.status]
              }`}
            >
              {job.status}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Customer */}
          <div className="flex items-center gap-2 text-primary-grey-600">
            <IoPersonOutline size={16} className="text-primary-grey-400" />
            <span className="truncate">{job.customer_name || 'N/A'}</span>
          </div>

          {/* Job Type */}
          <div className="flex items-center gap-2 text-primary-grey-600">
            <IoReaderOutline size={16} className="text-primary-grey-400" />
            <span className="truncate">{job.type || 'N/A'}</span>
          </div>

          {/* City */}
          <div className="flex items-center gap-2 text-primary-grey-600">
            <IoLocationOutline size={16} className="text-primary-grey-400" />
            <span className="truncate">{job.city}</span>
          </div>

          {/* Rate */}
          <div className="flex items-center gap-2 text-primary-grey-600">
            <IoCashOutline size={16} className="text-primary-grey-400" />
            <span className="font-medium text-[#3D1D1C]">
              {formatters.currency(job.rate)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-primary-grey-200 flex items-center justify-between text-xs text-primary-grey-500">
          <div className="flex items-center gap-1">
            <IoCalendarOutline size={14} />
            <span>Delivery: {formatters.date(job.delivery_date)}</span>
          </div>
          {job.size && (
            <span className="bg-primary-grey-100 px-2 py-1 rounded">
              Size: {job.size}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default JobCard;