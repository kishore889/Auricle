import { apiGet } from './client';
import type { SpeechResult } from '../types';
import type { PaginatedResponse } from './analysis.api';

/**
 * GET /api/speech/current
 */
export function getCurrentSpeech(accessToken?: string): Promise<SpeechResult> {
  return apiGet<SpeechResult>('/api/speech/current', { accessToken });
}

/**
 * GET /api/speech/history
 */
export function getSpeechHistory(
  params?: { page?: number; pageSize?: number },
  accessToken?: string
): Promise<PaginatedResponse<SpeechResult>> {
  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  const path = `/api/speech/history${query ? `?${query}` : ''}`;
  return apiGet<PaginatedResponse<SpeechResult>>(path, { accessToken });
}
