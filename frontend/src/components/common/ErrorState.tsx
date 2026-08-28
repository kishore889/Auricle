import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  details?: string | Record<string, unknown> | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorState — Standard error display with optional technical details and retry action.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to load data. Please try again.',
  details,
  onRetry,
  className,
}: ErrorStateProps): React.ReactElement {
  const [showDetails, setShowDetails] = useState(false);

  const formattedDetails =
    typeof details === 'object' && details !== null
      ? JSON.stringify(details, null, 2)
      : String(details ?? '');

  return (
    <div
      className={cn(
        'rounded-xl p-6 flex flex-col items-center text-center border',
        className
      )}
      style={{
        backgroundColor: 'var(--color-critical-light)',
        borderColor: 'var(--color-critical-border)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
        style={{
          backgroundColor: 'rgba(192,54,44,0.1)',
          border: '1px solid var(--color-critical-border)',
          color: 'var(--color-critical)',
        }}
      >
        <AlertTriangle className="w-5 h-5" />
      </div>

      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-critical)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-md mt-1 mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors mb-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface-2)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface)')}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      )}

      {details && (
        <div
          className="w-full max-w-md mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--color-critical-border)' }}
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-xs transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showDetails ? 'Hide technical details' : 'View technical details'}
          </button>

          {showDetails && (
            <pre
              className="mt-2 p-3 rounded-lg text-[11px] font-mono text-left overflow-x-auto max-h-40 border"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-critical)',
              }}
            >
              {formattedDetails}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
