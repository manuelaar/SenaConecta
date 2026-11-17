import type { RequestStatus } from '@/types';
import { STATUS_META } from '@/types';
import {
  Clock,
  UserCheck,
  CalendarCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const ICONS = {
  Clock,
  UserCheck,
  CalendarCheck,
  CheckCircle,
  XCircle,
};

const COLORS: Record<string, string> = {
  pending: 'bg-pending-bg text-pending-fg border-pending-border',
  assigned: 'bg-assigned-bg text-assigned-fg border-assigned-border',
  confirmed: 'bg-confirmed-bg text-confirmed-fg border-confirmed-border',
  served: 'bg-served-bg text-served-fg border-served-border',
  cancelled: 'bg-cancelled-bg text-cancelled-fg border-cancelled-border',
};

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = ICONS[meta.icon as keyof typeof ICONS];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 font-semibold whitespace-nowrap',
        COLORS[meta.color],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
