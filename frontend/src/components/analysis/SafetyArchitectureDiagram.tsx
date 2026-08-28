import React from 'react';

export function SafetyArchitectureDiagram(): React.ReactElement {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Dual-Stream Parallel Safety Processing Architecture
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Auricle Research Flow
        </span>
      </div>

      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 font-mono text-xs overflow-x-auto">
        <div className="min-w-[650px] flex flex-col items-center space-y-4">
          {/* Top Source Node */}
          <div className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-bold tracking-wider">
            ENVIRONMENTAL AUDIO INPUT
          </div>

          <div className="text-gray-500 font-bold">│</div>
          <div className="text-gray-500 font-bold">┌───────────────────────────┴───────────────────────────┐</div>

          {/* Parallel Stream Columns */}
          <div className="w-full flex justify-between gap-8 px-4">
            {/* Stream 1: Normal Processing */}
            <div className="flex-1 bg-gray-900/80 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col items-center space-y-2 text-center">
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                NORMAL PROCESSING STREAM
              </span>
              <div className="w-full py-1.5 rounded bg-gray-950 border border-gray-800 text-gray-300">
                Speech Enhancement
              </div>
              <span className="text-gray-500">↓</span>
              <div className="w-full py-1.5 rounded bg-gray-950 border border-gray-800 text-gray-300">
                Auditory Feature Mapping
              </div>
            </div>

            {/* Stream 2: Safety Analysis Stream */}
            <div className="flex-1 bg-gray-900/80 border border-amber-500/30 rounded-xl p-3.5 flex flex-col items-center space-y-2 text-center">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                SAFETY ANALYSIS STREAM
              </span>
              <div className="w-full py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                Horn / Siren / Alarm Detection
              </div>
              <span className="text-gray-500">↓</span>
              <div className="w-full py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                Priority Safety Evaluation
              </div>
            </div>
          </div>

          <div className="text-gray-500 font-bold">└───────────────────────────┬───────────────────────────┘</div>
          <div className="text-gray-500 font-bold">↓</div>

          {/* Bottom Output Manager */}
          <div className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white font-bold tracking-wider shadow-lg shadow-cyan-600/20">
            OUTPUT MANAGER (Virtual Channel Activation + LED Display)
          </div>
        </div>
      </div>
    </div>
  );
}
