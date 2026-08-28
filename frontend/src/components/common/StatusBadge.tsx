import React from 'react';
import { cn } from '../../lib/utils';

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'active'
  | 'pending';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<StatusVariant, { bg: string; border: string; text: string; dot: string }> = {
  success: {
    bg: 'bg-[#16A34A]/10',
    border: 'border-[#16A34A]/20',
    text: 'text-[#16A34A]',
    dot: 'bg-[#16A34A]',
  },
  warning: {
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/20',
    text: 'text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
  },
  danger: {
    bg: 'bg-[#DC2626]/10',
    border: 'border-[#DC2626]/20',
    text: 'text-[#DC2626]',
    dot: 'bg-[#DC2626]',
  },
  info: {
    bg: 'bg-[#2F80ED]/10',
    border: 'border-[#2F80ED]/20',
    text: 'text-[#2F80ED]',
    dot: 'bg-[#2F80ED]',
  },
  neutral: {
    bg: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-[#94A3B8]',
    dot: 'bg-[#94A3B8]',
  },
  active: {
    bg: 'bg-[#2F80ED]/10',
    border: 'border-[#2F80ED]/20',
    text: 'text-[#2F80ED]',
    dot: 'bg-[#2F80ED]',
  },
  pending: {
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/20',
    text: 'text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
  },
};

function inferVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (['connected', 'running', 'active', 'healthy', 'ok', 'resolved', 'working', 'sampling'].includes(s)) return 'success';
  if (['connecting', 'reconnecting', 'processing', 'standby', 'acknowledged'].includes(s)) return 'warning';
  if (['disconnected', 'error', 'critical', 'offline', 'failed', 'unavailable'].includes(s)) return 'danger';
  if (['idle', 'stopped', 'info', 'paused'].includes(s)) return 'neutral';
  return 'info';
}

export function StatusBadge({
  status,
  variant,
  size = 'md',
  pulse = false,
  className,
}: StatusBadgeProps): React.ReactElement {
  const resolvedVariant = variant ?? inferVariant(status);
  const style = VARIANT_STYLES[resolvedVariant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide select-none',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        style.bg,
        style.border,
        style.text,
        className
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          style.dot,
          pulse || resolvedVariant === 'pending' || status === 'connecting' ? 'animate-pulse' : ''
        )}
      />
      <span className="capitalize">{status}</span>
    </span>
  );
}
