// =============================================================================
// AURICLE Mock Data — Device
//
// Mock data for development/testing only.
// Keep isolated from API services.
// NEVER silently substitute mock data when real backend mode fails.
// =============================================================================

import type { DeviceStatus } from '../types';

export const mockDeviceStatus: DeviceStatus = {
  esp32Connected: true,
  esp32Id: 'ESP32-AURICLE-001',
  esp32LastHeartbeat: new Date().toISOString(),
  microphoneActive: true,
  microphoneInputState: 'sampling',
  microphoneLastUpdate: new Date().toISOString(),
  aiEngineState: 'running',
  dspEngineState: 'running',
  ledArrayActive: true,
  ledArrayChannels: 22,
  serialCommunicationOk: true,
  backendRestStatus: 'disconnected',
  backendWsStatus: 'disconnected',
  overallHealth: 'healthy',
  lastUpdated: new Date().toISOString(),
};

export const mockDeviceSummary = {
  id: 'ESP32-AURICLE-001',
  name: 'Auricle Research Prototype v1',
  type: 'esp32' as const,
  firmwareVersion: '0.3.2-alpha',
  connectedAt: new Date(Date.now() - 3_600_000).toISOString(),
};
