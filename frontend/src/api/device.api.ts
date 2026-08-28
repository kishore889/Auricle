import { apiGet } from './client';
import type { DeviceStatus } from '../types';

export interface DeviceSummary {
  id: string;
  name: string;
  type: 'esp32';
  firmwareVersion: string | null;
  connectedAt: string | null;
}

/**
 * GET /api/device/status
 * Returns the current full device status including ESP32, microphone, engines.
 */
export function getDeviceStatus(accessToken?: string): Promise<DeviceStatus> {
  return apiGet<DeviceStatus>('/api/device/status', { accessToken });
}

/**
 * GET /api/device
 * Returns device metadata/summary.
 */
export function getDevice(accessToken?: string): Promise<DeviceSummary> {
  return apiGet<DeviceSummary>('/api/device', { accessToken });
}
