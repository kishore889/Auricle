import { apiGet, apiPost } from './client';
import type { AudioStatus } from '../types';

/**
 * GET /api/audio/status
 */
export function getAudioStatus(accessToken?: string): Promise<AudioStatus> {
  return apiGet<AudioStatus>('/api/audio/status', { accessToken });
}

/**
 * POST /api/audio/start
 * Instructs the backend to begin audio capture and processing.
 */
export function startAudio(accessToken?: string): Promise<void> {
  return apiPost<void>('/api/audio/start', undefined, { accessToken });
}

/**
 * POST /api/audio/stop
 * Instructs the backend to stop audio capture and processing.
 */
export function stopAudio(accessToken?: string): Promise<void> {
  return apiPost<void>('/api/audio/stop', undefined, { accessToken });
}
