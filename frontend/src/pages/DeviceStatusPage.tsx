import React from 'react';
import {
  Smartphone,
  Cpu,
  Mic,
  BrainCircuit,
  Radio,
  Layers,
  RefreshCw,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockDeviceStatus, mockDeviceSummary } from '../mocks/device.mock';
import { formatTimestamp } from '../lib/utils';

export default function DeviceStatusPage(): React.ReactElement {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Page Header */}
      <PageHeader
        title="Auricle Hardware & Technical Telemetry"
        description="Comprehensive technical status breakdown for MEMS audio input, ESP32 microcontroller, AI & DSP engines, serial connection, and LED output array."
        icon={Smartphone}
        badgeText="All Hardware OK"
        lastUpdated={formatTimestamp(mockDeviceStatus.lastUpdated)}
        actions={
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#E8EEF8] text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        }
      />

      {/* Hardware Architecture End-to-End Diagram Banner */}
      <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#E8EEF8]">
            <Activity className="w-4 h-4 text-[#2F80ED]" />
            <h3 className="text-sm font-semibold">Auricle End-to-End Hardware Data Pipeline</h3>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20">
            Pipeline Active
          </span>
        </div>

        {/* Visual Pipeline Flow Diagram */}
        <div className="bg-black/20 p-4 rounded-xl border border-white/6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] text-center font-mono text-xs">
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#132238] border border-white/6 w-32">
              <span className="text-[#94A3B8] text-[10px]">Acoustic Source</span>
              <span className="font-medium text-[#E8EEF8] mt-1">Sound Waves</span>
            </div>

            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="flex flex-col items-center p-3 rounded-xl bg-[#132238] border border-[#2F80ED]/30 w-36">
              <span className="text-[#2F80ED] text-[10px]">MEMS Sensor</span>
              <span className="font-medium text-[#E8EEF8] mt-1">INMP441 (I2S)</span>
            </div>

            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="flex flex-col items-center p-3 rounded-xl bg-[#132238] border border-[#2F80ED]/30 w-36">
              <span className="text-[#2F80ED] text-[10px]">Microcontroller</span>
              <span className="font-medium text-[#E8EEF8] mt-1">ESP32 Module</span>
            </div>

            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="flex flex-col items-center p-3 rounded-xl bg-[#132238] border border-[#16A34A]/30 w-40">
              <span className="text-[#16A34A] text-[10px]">Processing</span>
              <span className="font-medium text-[#E8EEF8] mt-1">AI + DSP Pipeline</span>
            </div>

            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="flex flex-col items-center p-3 rounded-xl bg-[#132238] border border-[#2F80ED]/30 w-36">
              <span className="text-[#2F80ED] text-[10px]">Simulation</span>
              <span className="font-medium text-[#E8EEF8] mt-1">22-Ch Mapping</span>
            </div>

            <span className="text-[#2F80ED] font-bold">→</span>

            <div className="flex flex-col items-center p-3 rounded-xl bg-[#132238] border border-[#16A34A]/30 w-36">
              <span className="text-[#16A34A] text-[10px]">Output Display</span>
              <span className="font-medium text-[#E8EEF8] mt-1">ESP32 LED Array</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Hardware & Service Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Panel 1: INMP441 MEMS Microphone */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/6 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2F80ED]/10 text-[#2F80ED]">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF8]">MEMS Microphone</h3>
                <p className="text-xs text-[#94A3B8]">INMP441 I2S Digital Input</p>
              </div>
            </div>
            <StatusBadge status={mockDeviceStatus.microphoneInputState} size="sm" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">Interface:</span>
              <span className="text-[#E8EEF8]">I2S Bus (ESP32)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">Sampling Rate:</span>
              <span className="text-[#2F80ED] font-semibold">16.0 kHz</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">Bit Depth:</span>
              <span className="text-[#E8EEF8]">16-bit PCM Mono</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#94A3B8]">Buffer Status:</span>
              <span className="text-[#16A34A] font-semibold">Healthy</span>
            </div>
          </div>
        </div>

        {/* Panel 2: ESP32 Microcontroller */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/6 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2F80ED]/10 text-[#2F80ED]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF8]">ESP32 Hardware</h3>
                <p className="text-xs text-[#94A3B8]">{mockDeviceSummary.name}</p>
              </div>
            </div>
            <StatusBadge status={mockDeviceStatus.esp32Connected ? 'Connected' : 'Disconnected'} size="sm" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">Device ID:</span>
              <span className="text-[#E8EEF8]">{mockDeviceStatus.esp32Id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">Firmware:</span>
              <span className="text-[#2F80ED] font-semibold">{mockDeviceSummary.firmwareVersion}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">Serial Baud:</span>
              <span className="text-[#E8EEF8]">115200 Baud (COM3)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#94A3B8]">Heartbeat:</span>
              <span className="text-[#16A34A] font-semibold">&lt; 100ms Ping</span>
            </div>
          </div>
        </div>

        {/* Panel 3: AI & DSP Processing Engines */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/6 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF8]">AI & DSP Subsystems</h3>
                <p className="text-xs text-[#94A3B8]">Feature Extraction Engine</p>
              </div>
            </div>
            <StatusBadge status="Running" size="sm" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">AI Inference Engine:</span>
              <StatusBadge status={mockDeviceStatus.aiEngineState} size="sm" />
            </div>
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">DSP Signal Engine:</span>
              <StatusBadge status={mockDeviceStatus.dspEngineState} size="sm" />
            </div>
            <div className="flex justify-between py-1 border-b border-white/6">
              <span className="text-[#94A3B8]">Inference Latency:</span>
              <span className="text-[#16A34A] font-semibold">42 ms</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#94A3B8]">Safety Monitor:</span>
              <span className="text-[#E8EEF8]">Active</span>
            </div>
          </div>
        </div>

        {/* Panel 4: System Connections */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/6 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2F80ED]/10 text-[#2F80ED]">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF8]">System Services</h3>
                <p className="text-xs text-[#94A3B8]">REST API & WebSocket</p>
              </div>
            </div>
            <StatusBadge status="Active" size="sm" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/6">
              <span className="text-[#94A3B8]">REST API Server</span>
              <span className="text-[#16A34A] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/6">
              <span className="text-[#94A3B8]">WebSocket Stream</span>
              <span className="text-[#16A34A] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Panel 5: ESP32 LED Array Output */}
        <div className="bg-[#132238] border border-white/6 rounded-2xl p-6 space-y-4 shadow-lg md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/6 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2F80ED]/10 text-[#2F80ED]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF8]">ESP32 LED Array Hardware Output</h3>
                <p className="text-xs text-[#94A3B8]">Cochlear Channel Visualization</p>
              </div>
            </div>
            <StatusBadge status={mockDeviceStatus.ledArrayActive ? 'Active' : 'Inactive'} size="sm" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/20 border border-white/6">
              <span className="text-[#94A3B8] text-[10px] block">Total Channels</span>
              <span className="text-base font-semibold text-[#E8EEF8] mt-1 block">22 Channels</span>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/6">
              <span className="text-[#94A3B8] text-[10px] block">LED Display</span>
              <span className="text-base font-semibold text-[#2F80ED] mt-1 block">22 LEDs Active</span>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/6">
              <span className="text-[#94A3B8] text-[10px] block">Strategy</span>
              <span className="text-base font-semibold text-[#16A34A] mt-1 block">CIS-Inspired</span>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/6">
              <span className="text-[#94A3B8] text-[10px] block">Port Link</span>
              <span className="text-base font-semibold text-[#E8EEF8] mt-1 block">COM3 Serial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
