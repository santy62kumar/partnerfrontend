import React from 'react';
import Card from '@components/common/Card';
import { formatters } from '@utils/formatters';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@utils/constants';
import { useToast } from '@hooks/useToast';
import {
  IoPersonOutline,
  IoReaderOutline,
  IoLocationOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoResizeOutline,
  IoMapOutline,
  IoCopyOutline,
} from 'react-icons/io5';

const JobDetails = ({ job }) => {
  const toast = useToast();

  const copyToClipboard = async (value, label) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const details = [
    {
      label: 'Customer',
      value: job.customer_name || 'N/A',
      icon: IoPersonOutline,
    },
    {
      label: 'Job Type',
      value: job.type || 'N/A',
      icon: IoReaderOutline,
    },
    {
      label: 'Address',
      value: (
        <button
          type="button"
          className="line-clamp-3 text-left break-words hover:text-primary transition-colors"
          title={job.address || 'N/A'}
          onClick={() => copyToClipboard(job.address, 'Address')}
        >
          {job.address || 'N/A'}
        </button>
      ),
      icon: IoLocationOutline,
    },
    {
      label: 'Pincode',
      value: job.pincode || 'N/A',
      icon: IoLocationOutline,
    },
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
      value: job.google_map_link ? (
        <a
          href={job.google_map_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <IoMapOutline size={14} />
          Open location
        </a>
      ) : 'N/A',
      icon: IoLocationOutline,
    },
    {
      label: 'Start Date',
      value: formatters.date(job.start_date) || 'N/A',
      icon: IoCalendarOutline,
    },
    {
      label: 'Delivery Date',
      value: formatters.date(job.delivery_date) || 'N/A',
      icon: IoCalendarOutline,
    },
  ];

  return (
    <Card title="Job Information">
      <div className="space-y-4">
        <div className="pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold font-heading text-foreground mb-2">
                {job.name}
              </h3>
              <span className={JOB_STATUS_COLORS[job.status]}>
                {JOB_STATUS_LABELS[job.status] || job.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Payout</p>
              <p className="text-sm font-semibold text-primary">
                {formatters.currency(job.rate)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {details.map((detail, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-secondary/70 border border-border/70 rounded-lg"
            >
              <div className="p-2 bg-card rounded-lg">
                <detail.icon size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">
                  {detail.label}
                </p>
                <div className="text-sm font-medium text-foreground break-words">
                  {detail.value}
                </div>
              </div>
              {detail.label === 'Address' && job.address && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(job.address, 'Address')}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card rounded-md transition-colors"
                  aria-label="Copy address"
                  title="Copy address"
                >
                  <IoCopyOutline size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {job.description && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Description
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default JobDetails;
