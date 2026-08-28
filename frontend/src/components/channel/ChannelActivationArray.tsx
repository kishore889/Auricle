import React from 'react';
import type { ChannelActivation } from '../../types';
import { cn } from '../../lib/utils';

interface ChannelActivationArrayProps {
  activations: ChannelActivation[];
  strategy?: string;
  className?: string;
}

export function ChannelActivationArray({
  activations,
  strategy = 'CIS-inspired',
  className,
}: ChannelActivationArrayProps): React.ReactElement {
  return (
    <div className={cn('bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 select-none shadow-lg', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/6 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#E8EEF8]">
            Normalized Simulated Channel Activation (22 Channels)
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Normalized relative simulation values (0–100%). Not electrical current output.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED] font-semibold self-start sm:self-auto">
          Strategy: {strategy}
        </span>
      </div>

      {/* 22-Channel Progress Bar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {activations.map((ch) => {
          const pct = Math.round(ch.activation * 100);

          return (
            <div key={ch.channel} className="flex items-center gap-3 text-xs font-mono">
              <span className="w-10 text-[#94A3B8] font-bold shrink-0">{ch.label}</span>

              {/* Progress bar */}
              <div className="flex-1 h-4 bg-black/30 rounded-lg p-0.5 border border-white/6 overflow-hidden relative">
                <div
                  className={cn(
                    'h-full rounded-md transition-all duration-300',
                    pct > 75
                      ? 'bg-gradient-to-r from-[#2F80ED] to-[#16A34A]'
                      : 'bg-[#2F80ED]'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="w-10 text-right font-semibold text-[#2F80ED] shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
