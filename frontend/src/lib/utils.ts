import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a timestamp string or number to a localized display string.
 */
export function formatTimestamp(
  timestamp: string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
  return date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  });
}

/**
 * Formats a confidence value (0–1) as a percentage string.
 */
export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts a linear signal level (0–1) to approximate dB.
 * Returns -Inf for zero input.
 */
export function linearToDb(value: number): number {
  if (value <= 0) return -Infinity;
  return 20 * Math.log10(value);
}

/**
 * Returns a human-readable label for a sound category key.
 */
export function soundCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    speech: 'Speech',
    vehicle_horn: 'Vehicle Horn',
    siren: 'Siren',
    alarm: 'Alarm',
    doorbell: 'Doorbell',
    traffic: 'Traffic',
    human_voice: 'Human Voice',
    background_noise: 'Background Noise',
    other: 'Other',
    system: 'System',
  };
  return labels[category] ?? category;
}

/**
 * Returns a human-readable label for a connection/processing status.
 */
export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    connected: 'Connected',
    connecting: 'Connecting',
    disconnected: 'Disconnected',
    reconnecting: 'Reconnecting',
    error: 'Error',
    running: 'Running',
    processing: 'Processing',
    standby: 'Standby',
    idle: 'Idle',
    stopped: 'Stopped',
    active: 'Active',
    authenticated: 'Authenticated',
    unauthenticated: 'Unauthenticated',
    expired: 'Session Expired',
    loading: 'Loading',
    healthy: 'Healthy',
    degraded: 'Degraded',
    critical: 'Critical',
    offline: 'Offline',
  };
  return labels[status] ?? status;
}

/**
 * Delays execution for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
