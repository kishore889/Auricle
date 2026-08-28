import React, { useState } from 'react';
import { Radio, Mic, Activity, Volume2, Sparkles, Sliders } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AudioWaveformCanvas } from '../components/audio/AudioWaveformCanvas';
import { SpectrumCanvas } from '../components/audio/SpectrumCanvas';
import { AudioControls } from '../components/audio/AudioControls';
import { SoundMeter } from '../components/dashboard/SoundMeter';
import { StatusBadge } from '../components/common/StatusBadge';

export default function LiveAudioPage(): React.ReactElement {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [gain, setGain] = useState(100);
  const [showEnhanced, setShowEnhanced] = useState(true);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="Live Hearing Studio"
        description="Real-time acoustic signal capture, waveform visualization, frequency spectrum analysis, and AI noise suppression."
        icon={Radio}
        badgeText="60 FPS Live View"
      />

      {/* Audio Monitoring Controls Toolbar */}
      <AudioControls
        isMonitoring={isMonitoring}
        isMuted={isMuted}
        gain={gain}
        onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
        onToggleMute={() => setIsMuted(!isMuted)}
        onGainChange={setGain}
      />

      {/* Noise Reduction & Signal Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Input */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED]">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#E8EEF8]">Microphone Input</div>
              <div className="text-[11px] text-[#94A3B8]">High-sensitivity capture</div>
            </div>
          </div>
          <StatusBadge status={isMonitoring ? 'Active' : 'Idle'} size="sm" />
        </div>

        {/* Card 2: Noise Suppression Toggle */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#E8EEF8]">Noise Reduction</div>
              <div className="text-[11px] text-[#94A3B8]">AI Speech Enhance</div>
            </div>
          </div>
          <button
            onClick={() => setShowEnhanced(!showEnhanced)}
            className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
              showEnhanced
                ? 'bg-[#16A34A]/10 border-[#16A34A]/20 text-[#16A34A]'
                : 'bg-white/5 border-white/10 text-[#94A3B8]'
            }`}
          >
            {showEnhanced ? 'Active' : 'Bypassed'}
          </button>
        </div>

        {/* Card 3: Signal Clarity */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#E8EEF8]">Speech Clarity</div>
              <div className="text-[11px] text-[#94A3B8]">Clear acoustic profile</div>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#16A34A]">Optimal</span>
        </div>

        {/* Card 4: Processing Latency */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#E8EEF8]">Response Time</div>
              <div className="text-[11px] text-[#94A3B8]">Ultra-low latency</div>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#2F80ED]">28ms</span>
        </div>
      </div>

      {/* Main Canvas & Spectrum Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Waveform & Spectrum Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Waveform Renderer */}
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#2F80ED]" />
                <h2 className="text-sm font-semibold text-[#E8EEF8]">Real-Time Audio Waveform</h2>
              </div>
              <span className="text-xs font-mono text-[#94A3B8]/70">Time Domain Signal</span>
            </div>

            <AudioWaveformCanvas
              isMonitoring={isMonitoring}
              showEnhanced={showEnhanced}
              height={220}
            />
          </div>

          {/* FFT Spectrum Analyzer Canvas */}
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-[#2F80ED]" />
                <h2 className="text-sm font-semibold text-[#E8EEF8]">Frequency Spectrum Heatmap</h2>
              </div>
              <span className="text-xs font-mono text-[#94A3B8]/70">Frequency Spectrum (100Hz – 8kHz)</span>
            </div>

            <SpectrumCanvas
              isMonitoring={isMonitoring}
              barCount={36}
              height={220}
            />
          </div>
        </div>

        {/* Right Column (1 Col): Sound Meter & Processing Pipeline Stages */}
        <div className="space-y-6">
          {/* Sound Meter */}
          <SoundMeter
            signalLevel={isMonitoring ? (isMuted ? 0 : 0.45) : 0}
            signalDb={isMonitoring ? (isMuted ? -60 : -6.8) : -60}
            currentSound={isMonitoring ? 'Speech Pattern (16kHz)' : 'Listening Inactive'}
          />

          {/* Processing Stages Breakdown Card */}
          <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-[#E8EEF8]">Processing Pipeline Stages</h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/6">
                <span className="text-[#94A3B8]">1. Acoustic Signal Input</span>
                <span className="font-mono text-[#16A34A] font-medium">16.0 kHz</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/6">
                <span className="text-[#94A3B8]">2. Pre-Filtering & Gain</span>
                <span className="font-mono text-[#16A34A] font-medium">Active ({gain}%)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/6">
                <span className="text-[#94A3B8]">3. AI Speech Enhancement</span>
                <span className="font-mono text-[#2F80ED] font-medium">
                  {showEnhanced ? 'Enhanced' : 'Bypassed'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/6">
                <span className="text-[#94A3B8]">4. Channel Envelope Generation</span>
                <span className="font-mono text-[#2F80ED] font-medium">22 Channels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
