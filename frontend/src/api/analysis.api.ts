import { apiGet } from './client';
import type { SoundDetection } from '../types';

export interface SoundAnalysisHistoryParams {
  page?: number;
  pageSize?: number;
  category?: string;
  priority?: string;
  from?: string;
  to?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * GET /api/sound-analysis/current
 */
export function getCurrentDetection(accessToken?: string): Promise<SoundDetection> {
  return apiGet<SoundDetection>('/api/sound-analysis/current', { accessToken });
}

/**
 * GET /api/sound-analysis/history
 */
export function getSoundDetectionHistory(
  params?: SoundAnalysisHistoryParams,
  accessToken?: string
): Promise<PaginatedResponse<SoundDetection>> {
  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  const path = `/api/sound-analysis/history${query ? `?${query}` : ''}`;
  return apiGet<PaginatedResponse<SoundDetection>>(path, { accessToken });
}
