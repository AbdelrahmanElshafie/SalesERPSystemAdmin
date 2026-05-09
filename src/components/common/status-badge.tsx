import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'cancelled'
  | 'trial'
  | 'expired'
  | 'completed'
  | 'failed'
  | 'refunded';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  active: {
    label: 'Active',
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-600',
  },
  inactive: {
    label: 'Inactive',
    variant: 'secondary',
  },
  pending: {
    label: 'Pending',
    variant: 'outline',
    className: 'border-yellow-500 text-yellow-600',
  },
  suspended: {
    label: 'Suspended',
    variant: 'destructive',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'secondary',
    className: 'bg-gray-500',
  },
  trial: {
    label: 'Trial',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  expired: {
    label: 'Expired',
    variant: 'destructive',
    className: 'bg-orange-500 hover:bg-orange-600',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-600',
  },
  failed: {
    label: 'Failed',
    variant: 'destructive',
  },
  refunded: {
    label: 'Refunded',
    variant: 'outline',
    className: 'border-purple-500 text-purple-600',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || {
    label: status,
    variant: 'outline' as const,
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
