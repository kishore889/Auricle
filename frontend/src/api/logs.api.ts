import { apiGet } from './client';
import type { SystemLog } from '../types';
import type { PaginatedResponse } from './analysis.api';

export interface LogsQueryParams {
  page?: number;
  pageSize?: number;
  level?: string;
  component?: string;
  from?: string;
  to?: string;
  search?: string;
}

/**
 * GET /api/logs
 */
export function getLogs(
  params?: LogsQueryParams,
  accessToken?: string
): Promise<PaginatedResponse<SystemLog>> {
  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  const path = `/api/logs${query ? `?${query}` : ''}`;
  return apiGet<PaginatedResponse<SystemLog>>(path, { accessToken });
}
