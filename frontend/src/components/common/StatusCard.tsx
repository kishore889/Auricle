import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { StatusBadge, type StatusVariant } from './StatusBadge';
import { cn } from '../../lib/utils';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: string;
  statusVariant?: StatusVariant;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function StatusCard({
  title,
  value,
  subtitle,
  status,
  statusVariant,
  icon: Icon,
  trend,
  onClick,
  className,
  children,
}: StatusCardProps): React.ReactElement {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#132238] border border-white/6 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all duration-200',
        onClick && 'cursor-pointer hover:border-white/12 hover:bg-[#172942]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED]">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-medium text-[#94A3B8]">{title}</span>
        </div>

        {status && <StatusBadge status={status} variant={statusVariant} size="sm" />}
      </div>

      {/* Value */}
      <div className="my-1.5">
        <div className="text-2xl font-semibold text-[#E8EEF8] tracking-tight font-mono">{value}</div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  'text-xs font-mono font-medium',
                  trend.positive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                )}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-xs text-[#94A3B8]">{subtitle}</span>}
          </div>
        )}
      </div>

      {/* Optional Child content */}
      {children && <div className="mt-3 pt-3 border-t border-white/6">{children}</div>}
    </div>
  );
}
