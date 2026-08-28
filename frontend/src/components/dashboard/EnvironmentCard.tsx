import React from 'react';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { SoundCategory, Priority } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { soundCategoryLabel, formatConfidence, formatTimestamp, cn } from '../../lib/utils';

interface EnvironmentCardProps {
  category: SoundCategory;
  confidence: number;
  priority: Priority;
  timestamp: string;
  isSafetyEvent?: boolean;
  className?: string;
}

export function EnvironmentCard({
  category,
  confidence,
  priority,
  timestamp,
  isSafetyEvent = false,
  className,
}: EnvironmentCardProps): React.ReactElement {
  return (
    <div
      className={cn(
        'bg-[#132238] border rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-all',
        isSafetyEvent ? 'border-[#F59E0B]/30 bg-[#F59E0B]/5' : 'border-white/6',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'p-2.5 rounded-xl border',
              isSafetyEvent
                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'
                : 'bg-[#2F80ED]/10 border-[#2F80ED]/20 text-[#2F80ED]'
            )}
          >
            {isSafetyEvent ? <ShieldAlert className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#E8EEF8]">Current Environment</h3>
            <p className="text-xs text-[#94A3B8]">AI acoustic classification</p>
          </div>
        </div>

        <StatusBadge status={priority} size="sm" />
      </div>

      <div className="my-2">
        <div className="text-2xl font-semibold text-[#E8EEF8] capitalize tracking-tight">
          {soundCategoryLabel(category)}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-mono text-[#2F80ED] font-medium">
            {formatConfidence(confidence)} Confidence
          </span>
          {isSafetyEvent && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
              Safety Priority
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between text-xs text-[#94A3B8]">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Active Classification</span>
        </span>
        <span className="font-mono text-[#94A3B8]/70">{formatTimestamp(timestamp)}</span>
      </div>
    </div>
  );
}
