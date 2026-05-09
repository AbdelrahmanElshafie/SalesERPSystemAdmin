import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Infinity } from 'lucide-react';

interface LimitIndicatorProps {
  current: number;
  limit: number; // -1 means unlimited
  label: string;
  showPercentage?: boolean;
  className?: string;
}

export function LimitIndicator({
  current,
  limit,
  label,
  showPercentage = true,
  className,
}: LimitIndicatorProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isWarning = !isUnlimited && percentage >= 80;
  const isCritical = !isUnlimited && percentage >= 95;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {current.toLocaleString()}
          {' / '}
          {isUnlimited ? (
            <Infinity className="inline h-4 w-4" />
          ) : (
            limit.toLocaleString()
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="flex items-center gap-2">
          <Progress
            value={percentage}
            className={cn(
              'h-2',
              isCritical && '[&>div]:bg-destructive',
              isWarning && !isCritical && '[&>div]:bg-yellow-500'
            )}
          />
          {showPercentage && (
            <span
              className={cn(
                'text-xs font-medium',
                isCritical && 'text-destructive',
                isWarning && !isCritical && 'text-yellow-600'
              )}
            >
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      {isUnlimited && (
        <div className="h-2 rounded-full bg-green-100 dark:bg-green-950">
          <div className="h-full rounded-full bg-green-500" style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
