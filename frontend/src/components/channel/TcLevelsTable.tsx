import React from 'react';
import type { ChannelActivation } from '../../types';
import { cn } from '../../lib/utils';

interface TcLevelsTableProps {
  activations: ChannelActivation[];
  className?: string;
}

export function TcLevelsTable({ activations, className }: TcLevelsTableProps): React.ReactElement {
  return (
    <div className={cn('bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 select-none shadow-lg', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/6 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#E8EEF8]">
            Simulated Threshold & Comfort (T/C) Profiles
          </h3>
          <p className="text-xs text-[#F59E0B] font-medium mt-0.5">
            Simulation Parameters — Not Clinical Settings
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-[#94A3B8] border border-white/10">
          Research Profile
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-white/6 text-[#94A3B8] text-[11px]">
              <th className="py-2.5 px-3">Channel</th>
              <th className="py-2.5 px-3 text-right">Simulated T-Level</th>
              <th className="py-2.5 px-3 text-right">Simulated C-Level</th>
              <th className="py-2.5 px-3 text-right">Simulated Activation</th>
              <th className="py-2.5 px-3 text-center">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {activations.map((ch) => (
              <tr key={ch.channel} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#E8EEF8]">{ch.label}</td>
                <td className="py-2.5 px-3 text-right text-[#94A3B8]">{ch.tLevel}</td>
                <td className="py-2.5 px-3 text-right text-[#94A3B8]">{ch.cLevel}</td>
                <td className="py-2.5 px-3 text-right font-semibold text-[#2F80ED]">
                  {Math.round(ch.activation * 100)}%
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={cn(
                      'inline-block w-2 h-2 rounded-full',
                      ch.active ? 'bg-[#16A34A]' : 'bg-white/20'
                    )}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
