import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Clock } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase?: number;
  icon: LucideIcon;
  features: string[];
}

/**
 * PlaceholderPage — Temporary stub for pages not yet fully implemented.
 */
export function PlaceholderPage({
  title,
  description,
  icon: Icon,
  features,
}: PlaceholderPageProps): React.ReactElement {
  return (
    <div className="flex-1 p-6 min-h-0 overflow-auto">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Coming soon badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6"
          style={{
            backgroundColor: 'var(--color-accent-light)',
            border: '1px solid var(--color-accent-border)',
            color: 'var(--color-accent)',
          }}
        >
          <Clock className="w-3 h-3" />
          Coming soon
        </div>

        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {description}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-6" style={{ borderColor: 'var(--color-border)' }} />

        {/* Planned features */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Planned features
          </p>
          <ul className="space-y-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Info notice */}
        <div
          className="mt-8 rounded-xl p-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            This page is being prepared. Core application infrastructure is active
            and this view will be available in an upcoming update.
          </p>
        </div>
      </div>
    </div>
  );
}
