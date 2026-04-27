import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@components/ui/card';
import { formatters } from '@utils/formatters';
import { JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@utils/constants';
import { useAuthStore } from '@/store/authStore';
import {
  IoLocationOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoReaderOutline,
  IoArrowForwardOutline,
  IoLayersOutline,
} from 'react-icons/io5';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const getDueMeta = (deliveryDate) => {
    if (!deliveryDate) {
      return {
        label: 'No delivery date',
        className: 'text-muted-foreground',
      };
    }

    const due = new Date(deliveryDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = due.setHours(0, 0, 0, 0) - startOfToday.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return {
        label: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`,
        className: 'text-destructive',
      };
    }

    if (days === 0) {
      return {
        label: 'Due today',
        className: 'text-warning',
      };
    }

    return {
      label: `Due in ${days} day${days === 1 ? '' : 's'}`,
      className: 'text-success',
    };
  };

  const dueMeta = getDueMeta(job.delivery_date);
  const statusLabel = JOB_STATUS_LABELS[job.status] || job.status;
  const checklistCount = Array.isArray(job.checklists) ? job.checklists.length : null;
  const isCompleted = job.status === JOB_STATUS.COMPLETED;

  const handleClick = () => {
    navigate(`/dashboard/jobs/${job.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="group overflow-hidden border-border/80 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer bg-gradient-to-br from-card to-secondary/20 hover:-translate-y-1"
    >
      <CardContent className="p-5 flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              Job #{job.id}
            </p>
            <h3 className="text-lg font-semibold font-heading text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
              {job.name}
            </h3>
            <span className={JOB_STATUS_COLORS[job.status]}>
              {statusLabel}
            </span>
          </div>

          <div className="text-right shrink-0">
            <p className={`text-xs font-semibold ${dueMeta.className}`}>
              {isCompleted ? 'Delivered' : dueMeta.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatters.date(job.delivery_date)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm mt-1">
          <div className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-secondary/60 text-muted-foreground max-w-[calc(50%-0.25rem)] sm:max-w-none">
            <IoPersonOutline size={14} className="shrink-0" />
            <span className="truncate">{job.customer_name || 'N/A'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-secondary/60 text-muted-foreground max-w-[calc(50%-0.25rem)] sm:max-w-none">
            <IoReaderOutline size={14} className="shrink-0" />
            <span className="truncate">{job.type || 'N/A'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-secondary/60 text-muted-foreground max-w-[calc(50%-0.25rem)] sm:max-w-none">
            <IoLocationOutline size={14} className="shrink-0" />
            <span className="truncate">{job.city || 'N/A'}</span>
          </div>

          {!user?.is_internal && (
            <div className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-secondary/60 text-muted-foreground max-w-[calc(50%-0.25rem)] sm:max-w-none">
              <IoCashOutline size={14} className="shrink-0" />
              <span className="font-semibold text-primary truncate">
                {formatters.currency(job.rate)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-border/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1">
            <IoCalendarOutline size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              Delivery: {formatters.date(job.delivery_date) || 'Not set'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {job.size && (
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <IoLayersOutline size={14} />
                {job.size}
              </span>
            )}
            {typeof checklistCount === 'number' && (
              <span className="text-muted-foreground">
                • {checklistCount} items
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-semibold text-primary ml-1 group-hover:translate-x-0.5 transition-transform">
              View
              <IoArrowForwardOutline size={14} />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
