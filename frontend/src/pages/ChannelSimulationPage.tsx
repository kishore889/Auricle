import React, { useState } from 'react';
import { Layers, Sliders, Cpu, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ChannelActivationArray } from '../components/channel/ChannelActivationArray';
import { TcLevelsTable } from '../components/channel/TcLevelsTable';
import { HardwareLedMap } from '../components/channel/HardwareLedMap';
import { mockChannelActivations, mockChannelStatus } from '../mocks/channels.mock';
import type { ChannelStrategy } from '../types';
import { formatTimestamp } from '../lib/utils';

export default function ChannelSimulationPage(): React.ReactElement {
  const [strategy, setStrategy] = useState<ChannelStrategy>('cis_inspired');

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="Channel Mapping & Cochlear Simulation"
        description="22-channel spectral envelope decomposition, threshold/comfort stimulation profiles, and physical LED hardware output visualization."
        icon={Layers}
        badgeText="Research Use Only"
        lastUpdated={formatTimestamp(mockChannelStatus.lastUpdated)}
      />

      {/* Prominent Research Disclaimer Notice */}
      <div className="p-5 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#E8EEF8] flex items-start gap-3.5 shadow-lg select-none">
        <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#F59E0B]">
            Experimental Simulation – Research Use Only
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Channel activation values represent normalized relative envelope simulation parameters (0–100%) and are not actual electrical stimulation currents. T/C profiles are research simulation parameters, not clinical patient settings.
          </p>
        </div>
      </div>

      {/* Strategy Control Toolbar & Hardware Status Bar */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 select-none shadow-lg">
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-[#2F80ED]" />
          <span className="text-xs font-semibold text-[#E8EEF8]">Mapping Strategy:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStrategy('cis_inspired')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                strategy === 'cis_inspired'
                  ? 'bg-[#2F80ED] text-white shadow-md shadow-[#2F80ED]/20'
                  : 'bg-white/5 text-[#94A3B8] hover:text-[#E8EEF8] border border-white/6'
              }`}
            >
              CIS-Inspired Strategy
            </button>

            <button
              onClick={() => setStrategy('ace_inspired')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                strategy === 'ace_inspired'
                  ? 'bg-[#2F80ED] text-white shadow-md shadow-[#2F80ED]/20'
                  : 'bg-white/5 text-[#94A3B8] hover:text-[#E8EEF8] border border-white/6'
              }`}
            >
              ACE-Inspired Strategy
            </button>
          </div>
        </div>

        {/* Hardware Status Panel */}
        <div className="flex items-center gap-4 text-xs font-mono bg-black/20 px-4 py-2 rounded-xl border border-white/6">
          <div className="flex items-center gap-1.5 text-[#16A34A]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ESP32 Sync: OK</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#2F80ED]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LED Array: Active</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Cpu className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>22 Channels</span>
          </div>
        </div>
      </div>

      {/* Mapping Architecture Flow Diagram */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-3 select-none shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#E8EEF8]">
            Spectral Envelope Decomposition Pipeline
          </h3>
          <span className="text-xs font-mono text-[#2F80ED]">22 Spectral Bands</span>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/6 overflow-x-auto font-mono text-[11px]">
          <div className="min-w-[800px] flex items-center justify-between text-center">
            <div className="p-2.5 rounded-xl bg-[#132238] border border-white/6 w-32 text-[#94A3B8]">
              Acoustic Audio
            </div>
            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="p-2.5 rounded-xl bg-[#132238] border border-white/6 w-36 text-[#94A3B8]">
              FFT Decomposition
            </div>
            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="p-2.5 rounded-xl bg-[#132238] border border-white/6 w-32 text-[#94A3B8]">
              Channel Energy
            </div>
            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="p-2.5 rounded-xl bg-[#132238] border border-white/6 w-32 text-[#94A3B8]">
              N-of-M Selection
            </div>
            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="p-2.5 rounded-xl bg-[#132238] border border-white/6 w-32 text-[#94A3B8]">
              Envelope Mapping
            </div>
            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="p-2.5 rounded-xl bg-[#2F80ED] text-white font-bold w-36 shadow-lg shadow-[#2F80ED]/20">
              LED Output
            </div>
          </div>
        </div>
      </div>

      {/* 22-Channel Activation Array Component */}
      <ChannelActivationArray
        activations={mockChannelActivations}
        strategy={strategy === 'cis_inspired' ? 'CIS-inspired research mapping' : 'ACE-inspired research mapping'}
      />

      {/* ESP32 Physical LED Output Hardware Mapping */}
      <HardwareLedMap activations={mockChannelActivations} />

      {/* T/C Simulation Parameters Table */}
      <TcLevelsTable activations={mockChannelActivations} />
    </div>
  );
}
