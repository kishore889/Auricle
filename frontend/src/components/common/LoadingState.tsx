import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
  skeletonRows?: number;
}

/**
 * LoadingState — Standard loading layout with optional skeleton rows.
 */
export function LoadingState({
  message = 'Loading…',
  className,
  skeletonRows,
}: LoadingStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center min-h-[200px]',
        className
      )}
    >
      <Loader2
        className="w-8 h-8 animate-spin mb-3"
        style={{ color: 'var(--color-accent)' }}
      />
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {message}
      </p>

      {skeletonRows && (
        <div className="w-full max-w-md mt-6 space-y-2">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded-md animate-pulse"
              style={{
                backgroundColor: 'var(--color-surface-3)',
                opacity: 1 - i * 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
