import { apiGet } from './client';
import type { HistoryRecord } from '../types';
import type { PaginatedResponse } from './analysis.api';

export interface HistoryQueryParams {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  eventType?: string;
  category?: string;
  priority?: string;
  confidence?: number;
  deviceId?: string;
  sessionId?: string;
  search?: string;
}

/**
 * GET /api/history
 */
export function getHistory(
  params?: HistoryQueryParams,
  accessToken?: string
): Promise<PaginatedResponse<HistoryRecord>> {
  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  const path = `/api/history${query ? `?${query}` : ''}`;
  return apiGet<PaginatedResponse<HistoryRecord>>(path, { accessToken });
}
