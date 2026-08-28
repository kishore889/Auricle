import type { ChannelActivation, ChannelProfile, ChannelStatus } from '../types';

const TOTAL_CHANNELS = 22;

function buildActivations(): ChannelActivation[] {
  return Array.from({ length: TOTAL_CHANNELS }, (_, i) => {
    const ch = i + 1;
    // Simulate a frequency-shaped envelope — higher activation mid-range
    const baseActivation = Math.sin((ch / TOTAL_CHANNELS) * Math.PI) * 0.7 + Math.random() * 0.25;
    const activation = Math.max(0, Math.min(1, baseActivation));
    return {
      channel: ch,
      label: `CH${String(ch).padStart(2, '0')}`,
      activation,
      tLevel: 18 + Math.floor(Math.random() * 10),
      cLevel: 78 + Math.floor(Math.random() * 15),
      active: activation > 0.05,
    };
  });
}

export const mockChannelActivations: ChannelActivation[] = buildActivations();

export const mockChannelProfile: ChannelProfile = {
  id: 'profile-default',
  name: 'Research Default',
  strategy: 'cis_inspired',
  totalChannels: TOTAL_CHANNELS,
  activeChannels: mockChannelActivations.filter((c) => c.active).length,
  activations: mockChannelActivations,
  lastUpdated: new Date().toISOString(),
  sessionId: 'session-001',
};

export const mockChannelStatus: ChannelStatus = {
  mappingActive: true,
  strategy: 'cis_inspired',
  totalChannels: TOTAL_CHANNELS,
  activeChannels: mockChannelProfile.activeChannels,
  ledVisualizationActive: true,
  lastUpdated: new Date().toISOString(),
};
