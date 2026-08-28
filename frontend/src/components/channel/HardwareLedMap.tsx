import React from 'react';
import type { ChannelActivation } from '../../types';
import { cn } from '../../lib/utils';

interface HardwareLedMapProps {
  activations: ChannelActivation[];
  className?: string;
}

export function HardwareLedMap({ activations, className }: HardwareLedMapProps): React.ReactElement {
  return (
    <div className={cn('bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 select-none shadow-lg', className)}>
      <div className="flex items-center justify-between border-b border-white/6 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#E8EEF8]">
            ESP32 Physical LED Output Array Mapping
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Virtual Channel simulation to physical LED indicator array on prototype board.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] font-medium">
          Hardware Sync OK
        </span>
      </div>

      {/* Grid of LED items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {activations.map((ch) => {
          const isActive = ch.activation > 0.15;

          return (
            <div
              key={ch.channel}
              className={cn(
                'p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all',
                isActive
                  ? 'bg-[#2F80ED]/10 border-[#2F80ED]/30 text-[#2F80ED]'
                  : 'bg-black/20 border-white/6 text-[#94A3B8]/60'
              )}
            >
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded-full mb-1.5 transition-all shadow-xs',
                  isActive ? 'bg-[#2F80ED] shadow-[#2F80ED]/50 animate-pulse' : 'bg-white/20'
                )}
              />
              <span className="text-xs font-mono font-semibold">
                {ch.label} → LED {String(ch.channel).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8] mt-0.5">
                {Math.round(ch.activation * 100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
