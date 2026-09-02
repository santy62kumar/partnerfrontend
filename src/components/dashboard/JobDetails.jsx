import React from 'react';
import Card from '@components/common/Card';
import { formatters } from '@utils/formatters';
import { JOB_STATUS_LABELS } from '@utils/constants';
import { JOB_STATUS_TONE } from '@utils/status';
import StatusBadge from '@components/common/StatusBadge';
import { useToast } from '@hooks/useToast';
import { useAuthStore } from '@/store/authStore';
import Button from '@components/common/Button';
import {
  IoPersonOutline,
  IoReaderOutline,
  IoLocationOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoResizeOutline,
  IoMapOutline,
  IoCopyOutline,
  IoDocumentAttachOutline,
} from 'react-icons/io5';

const JobDetails = ({ job }) => {
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const isInternal = user?.is_internal;

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
        <Button
          variant="ghost"
          type="button"
          className="h-auto justify-start whitespace-normal p-0 text-left break-words hover:text-primary"
          title={[job.address_line_1, job.address_line_2, job.city, job.state, job.pincode].filter(Boolean).join(', ')}
          onClick={() => copyToClipboard([job.address_line_1, job.address_line_2, job.city, job.state, job.pincode].filter(Boolean).join(', '), 'Address')}
        >
          {[job.address_line_1, job.address_line_2].filter(Boolean).join(', ') || 'N/A'}
          {(job.city || job.state || job.pincode) && (
            <>
              <br />
              <span className="text-xs text-muted-foreground">
                {[job.city, job.state, job.pincode].filter(Boolean).join(', ')}
              </span>
            </>
          )}
        </Button>
      ),
      icon: IoLocationOutline,
    },
    {
      label: 'Size',
      value: job.size || 'N/A',
      icon: IoResizeOutline,
    },
    ...(!isInternal ? [{
      label: 'Rate',
      value: formatters.currency(job.rate),
      icon: IoCashOutline,
    }] : []),
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
    ...(job.drawing_document_link ? [{
      label: 'Job Drawing',
      value: (
        <a
          href={job.drawing_document_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Open drawing
        </a>
      ),
      icon: IoDocumentAttachOutline,
    }] : []),
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
              <StatusBadge tone={JOB_STATUS_TONE[job.status]}>
                {JOB_STATUS_LABELS[job.status] || job.status}
              </StatusBadge>
            </div>
            {!isInternal && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Payout</p>
                <p className="text-sm font-semibold text-primary">
                  {formatters.currency(job.rate)}
                </p>
              </div>
            )}
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
              {detail.label === 'Address' && (job.address_line_1 || job.address_line_2 || job.city) && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => copyToClipboard([job.address_line_1, job.address_line_2, job.city, job.state, job.pincode].filter(Boolean).join(', '), 'Address')}
                  className="size-8 p-0 text-muted-foreground hover:bg-card hover:text-foreground"
                  aria-label="Copy address"
                  title="Copy address"
                >
                  <IoCopyOutline size={16} />
                </Button>
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
