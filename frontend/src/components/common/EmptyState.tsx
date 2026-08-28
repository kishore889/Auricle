import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * EmptyState — Standardized empty data placeholder with optional action.
 */
export function EmptyState({
  title = 'Nothing here yet',
  description = 'There are no records or events to display at this time.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed min-h-[220px]',
        className
      )}
      style={{
        backgroundColor: 'var(--color-surface-2)',
        borderColor: 'var(--color-border-2)',
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm mt-1 mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--color-accent)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
