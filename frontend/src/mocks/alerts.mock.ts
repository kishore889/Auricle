import type { Alert, AlertType, AlertSeverity } from '../types';

function makeAlert(
  id: string,
  offsetMs: number,
  type: AlertType,
  severity: AlertSeverity,
  message: string
): Alert {
  return {
    id,
    timestamp: new Date(Date.now() - offsetMs).toISOString(),
    severity,
    type,
    status: 'active',
    message,
    source: type.includes('esp32') || type.includes('hardware')
      ? 'esp32'
      : type.includes('backend') || type.includes('websocket')
        ? 'backend'
        : type.includes('ai')
          ? 'ai_engine'
          : type.includes('channel')
            ? 'channel_mapping'
            : type.includes('microphone')
              ? 'mems_microphone'
              : 'frontend',
    acknowledgedAt: null,
    resolvedAt: null,
    metadata: null,
  };
}

export const mockAlerts: Alert[] = [
  makeAlert('alert-001', 5_000, 'vehicle_horn', 'warning', 'Vehicle horn detected in environment'),
  makeAlert('alert-002', 30_000, 'siren', 'critical', 'Emergency siren detected — high priority'),
  makeAlert('alert-003', 90_000, 'esp32_disconnected', 'error', 'ESP32 device communication lost'),
  makeAlert('alert-004', 180_000, 'ai_processing_failure', 'warning', 'AI engine inference latency exceeded threshold'),
  makeAlert('alert-005', 600_000, 'channel_mapping_warning', 'info', 'Channel mapping strategy reset to default'),
];
