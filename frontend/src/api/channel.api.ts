import { apiGet, apiPut } from './client';
import type { ChannelProfile, ChannelStatus } from '../types';

export interface UpdateChannelProfileRequest {
  name?: string;
  strategy?: 'cis_inspired' | 'ace_inspired';
  totalChannels?: number;
}

/**
 * GET /api/channels/profile
 */
export function getChannelProfile(accessToken?: string): Promise<ChannelProfile> {
  return apiGet<ChannelProfile>('/api/channels/profile', { accessToken });
}

/**
 * PUT /api/channels/profile
 */
export function updateChannelProfile(
  data: UpdateChannelProfileRequest,
  accessToken?: string
): Promise<ChannelProfile> {
  return apiPut<ChannelProfile>('/api/channels/profile', data, { accessToken });
}

/**
 * GET /api/channels/status
 */
export function getChannelStatus(accessToken?: string): Promise<ChannelStatus> {
  return apiGet<ChannelStatus>('/api/channels/status', { accessToken });
}
