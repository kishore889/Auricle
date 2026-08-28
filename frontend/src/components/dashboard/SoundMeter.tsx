import React from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SoundMeterProps {
  signalLevel: number; // 0 to 1
  signalDb: number; // e.g. -60 to 0 dB
  currentSound?: string;
  className?: string;
}

export function SoundMeter({
  signalLevel,
  signalDb,
  currentSound = 'Speech Detected (88% confidence)',
  className,
}: SoundMeterProps): React.ReactElement {
  const percentage = Math.min(100, Math.max(0, signalLevel * 100));
  const isHigh = percentage > 80;
  const isElevated = percentage > 50;

  return (
    <div className={cn('bg-[#132238] border border-white/6 rounded-2xl p-6 shadow-lg', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED]">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#E8EEF8] block">Live Sound Level</span>
            <span className="text-xs text-[#94A3B8]">Acoustic input intensity</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-lg font-semibold text-[#E8EEF8]">{percentage.toFixed(0)}%</span>
          <span className="text-xs text-[#94A3B8]">({signalDb.toFixed(1)} dB)</span>
        </div>
      </div>

      {/* Meter Bar */}
      <div className="w-full h-3.5 bg-black/30 rounded-full p-0.5 border border-white/6 relative overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-150',
            isHigh
              ? 'bg-gradient-to-r from-[#2F80ED] via-[#F59E0B] to-[#DC2626]'
              : isElevated
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#F59E0B]'
                : 'bg-[#2F80ED]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* dB Scale Labels */}
      <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]/60 mt-1.5 px-1 select-none">
        <span>-60 dB</span>
        <span>-30 dB</span>
        <span>-12 dB</span>
        <span className="text-[#F59E0B]">0 dB Threshold</span>
      </div>

      {/* Current Detected Sound Footer */}
      <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between text-xs">
        <span className="text-[#94A3B8]">Detected Sound Pattern:</span>
        <span className="font-medium text-[#2F80ED] font-mono">{currentSound}</span>
      </div>
    </div>
  );
}
