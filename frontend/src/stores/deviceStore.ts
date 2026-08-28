import { create } from 'zustand';
import type { ConnectionStatus } from '../types';

// ---------------------------------------------------------------------------
// Device Store — Lightweight device UI context only.
//
// This is for UI-level device context (e.g. selected device, quick-access status).
// Full device telemetry lives in TanStack Query + WebSocket handlers.
// Do NOT buffer high-frequency audio samples here.
// ---------------------------------------------------------------------------

interface DeviceState {
  selectedDeviceId: string | null;
  esp32Status: ConnectionStatus;
  microphoneStatus: ConnectionStatus;
  backendStatus: ConnectionStatus;
  wsStatus: ConnectionStatus;
  aiEngineStatus: 'running' | 'standby' | 'error' | 'idle';
  dspEngineStatus: 'running' | 'standby' | 'error' | 'idle';

  // Actions
  setSelectedDevice: (deviceId: string | null) => void;
  setEsp32Status: (status: ConnectionStatus) => void;
  setMicrophoneStatus: (status: ConnectionStatus) => void;
  setBackendStatus: (status: ConnectionStatus) => void;
  setWsStatus: (status: ConnectionStatus) => void;
  setAiEngineStatus: (status: DeviceState['aiEngineStatus']) => void;
  setDspEngineStatus: (status: DeviceState['dspEngineStatus']) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  selectedDeviceId: null,
  esp32Status: 'disconnected',
  microphoneStatus: 'disconnected',
  backendStatus: 'disconnected',
  wsStatus: 'disconnected',
  aiEngineStatus: 'idle',
  dspEngineStatus: 'idle',

  setSelectedDevice: (selectedDeviceId) => set({ selectedDeviceId }),
  setEsp32Status: (esp32Status) => set({ esp32Status }),
  setMicrophoneStatus: (microphoneStatus) => set({ microphoneStatus }),
  setBackendStatus: (backendStatus) => set({ backendStatus }),
  setWsStatus: (wsStatus) => set({ wsStatus }),
  setAiEngineStatus: (aiEngineStatus) => set({ aiEngineStatus }),
  setDspEngineStatus: (dspEngineStatus) => set({ dspEngineStatus }),
}));
