import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badgeText?: string;
  lastUpdated?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badgeText,
  lastUpdated,
  actions,
  children,
}: PageHeaderProps): React.ReactElement {
  return (
    <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Description */}
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="p-3 rounded-2xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED] shrink-0 mt-0.5">
              <Icon className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-[#E8EEF8] tracking-tight">{title}</h1>
              {badgeText && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED] text-xs font-medium">
                  {badgeText}
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {/* Actions & Timestamp */}
        <div className="flex items-center gap-3 shrink-0">
          {lastUpdated && (
            <span className="text-xs font-mono text-[#94A3B8]/60 hidden md:inline">
              Updated: {lastUpdated}
            </span>
          )}
          {actions}
        </div>
      </div>

      {children && <div className="mt-4 pt-4 border-t border-white/6">{children}</div>}
    </div>
  );
}
