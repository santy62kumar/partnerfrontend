import React from 'react';
import { Badge } from '@components/ui/badge';
import { cn } from '@/lib/utils';

// One status vocabulary for the whole app: every state maps to a tone, tones map
// to semantic tokens. No per-screen colour tables.
const TONE = {
  neutral: 'border-border bg-muted text-muted-foreground',
  info: 'border-info/30 bg-info/10 text-info',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const StatusBadge = ({ tone = 'neutral', className, children, ...props }) => (
  <Badge variant="outline" className={cn('rounded-full font-semibold', TONE[tone] || TONE.neutral, className)} {...props}>
    {children}
  </Badge>
);

export default StatusBadge;
