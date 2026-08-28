import React from 'react';
import { Play, Square, Volume2, VolumeX, Sliders, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AudioControlsProps {
  isMonitoring: boolean;
  isMuted: boolean;
  gain: number;
  onToggleMonitoring: () => void;
  onToggleMute: () => void;
  onGainChange: (gain: number) => void;
  className?: string;
}

export function AudioControls({
  isMonitoring,
  isMuted,
  gain,
  onToggleMonitoring,
  onToggleMute,
  onGainChange,
  className,
}: AudioControlsProps): React.ReactElement {
  return (
    <div
      className={cn(
        'bg-[#132238] border border-white/6 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 select-none shadow-lg',
        className
      )}
    >
      {/* Primary Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMonitoring}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md',
            isMonitoring
              ? 'bg-[#DC2626] hover:bg-[#DC2626]/90 text-white shadow-[#DC2626]/20'
              : 'bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white shadow-[#2F80ED]/20'
          )}
        >
          {isMonitoring ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Listening</span>
            </>
          )}
        </button>

        <button
          onClick={onToggleMute}
          className={cn(
            'p-2.5 rounded-xl border text-xs transition-colors',
            isMuted
              ? 'bg-[#DC2626]/10 border-[#DC2626]/20 text-[#DC2626]'
              : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-[#E8EEF8]'
          )}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Gain Slider */}
      <div className="flex items-center gap-3">
        <Sliders className="w-4 h-4 text-[#94A3B8]" />
        <span className="text-xs text-[#94A3B8] font-medium">Input Gain:</span>
        <input
          type="range"
          min="0"
          max="200"
          value={gain}
          onChange={(e) => onGainChange(Number(e.target.value))}
          className="w-32 accent-[#2F80ED] bg-black/30 rounded-lg cursor-pointer"
        />
        <span className="text-xs font-mono text-[#2F80ED] w-10 text-right font-medium">{gain}%</span>
      </div>

      {/* Audio Status Pill */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/20 border border-white/6 text-xs text-[#94A3B8]">
        <Cpu className="w-3.5 h-3.5 text-[#2F80ED]" />
        <span>Processing Mode:</span>
        <span className="font-mono text-[#16A34A] font-medium">
          Noise Suppression Active
        </span>
      </div>
    </div>
  );
}
