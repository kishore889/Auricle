import { apiGet } from './client';
import type { AIInsight, ProcessingState } from '../types';
import type { PaginatedResponse } from './analysis.api';

export interface AIEngineStatus {
  state: ProcessingState;
  modelLoaded: boolean;
  modelVersion: string | null;
  lastInferenceMs: number | null;
  inferenceCount: number;
  errorCount: number;
}

/**
 * GET /api/ai/status
 */
export function getAIStatus(accessToken?: string): Promise<AIEngineStatus> {
  return apiGet<AIEngineStatus>('/api/ai/status', { accessToken });
}

/**
 * GET /api/ai/insights
 */
export function getAIInsights(
  params?: { page?: number; pageSize?: number },
  accessToken?: string
): Promise<PaginatedResponse<AIInsight>> {
  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  const path = `/api/ai/insights${query ? `?${query}` : ''}`;
  return apiGet<PaginatedResponse<AIInsight>>(path, { accessToken });
}
