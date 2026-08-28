import { apiGet, apiPatch } from './client';
import type { Alert } from '../types';
import type { PaginatedResponse } from './analysis.api';

export interface AlertsQueryParams {
  page?: number;
  pageSize?: number;
  status?: 'active' | 'acknowledged' | 'resolved';
  severity?: string;
  type?: string;
  from?: string;
  to?: string;
}

export interface AcknowledgeAlertRequest {
  status: 'acknowledged' | 'resolved';
}

/**
 * GET /api/alerts
 */
export function getAlerts(
  params?: AlertsQueryParams,
  accessToken?: string
): Promise<PaginatedResponse<Alert>> {
  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  const path = `/api/alerts${query ? `?${query}` : ''}`;
  return apiGet<PaginatedResponse<Alert>>(path, { accessToken });
}

/**
 * PATCH /api/alerts/{id}
 * Acknowledge or resolve an alert.
 */
export function updateAlert(
  id: string,
  data: AcknowledgeAlertRequest,
  accessToken?: string
): Promise<Alert> {
  return apiPatch<Alert>(`/api/alerts/${id}`, data, { accessToken });
}
