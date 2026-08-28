import type { SoundDetection, SoundCategory, Priority } from '../types';

const CATEGORIES: SoundCategory[] = [
  'speech',
  'vehicle_horn',
  'siren',
  'alarm',
  'doorbell',
  'traffic',
  'human_voice',
  'background_noise',
];

const PRIORITY_BY_CATEGORY: Record<SoundCategory, Priority> = {
  speech: 'medium',
  vehicle_horn: 'high',
  siren: 'critical',
  alarm: 'critical',
  doorbell: 'medium',
  traffic: 'low',
  human_voice: 'medium',
  background_noise: 'low',
  other: 'low',
};

function makeSoundDetection(
  id: string,
  offsetMs: number,
  category?: SoundCategory
): SoundDetection {
  const cat: SoundCategory = category ?? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const confidence = 0.65 + Math.random() * 0.34;
  const priority = PRIORITY_BY_CATEGORY[cat];
  return {
    id,
    timestamp: new Date(Date.now() - offsetMs).toISOString(),
    category: cat,
    confidence,
    intensity: 0.3 + Math.random() * 0.7,
    priority,
    rawLabel: cat.replace(/_/g, ' '),
    isSafetyEvent: priority === 'high' || priority === 'critical',
  };
}

export const mockCurrentDetection: SoundDetection = makeSoundDetection('det-current', 0, 'speech');

export const mockDetectionHistory: SoundDetection[] = [
  makeSoundDetection('det-001', 2_000, 'speech'),
  makeSoundDetection('det-002', 8_000, 'vehicle_horn'),
  makeSoundDetection('det-003', 15_000, 'background_noise'),
  makeSoundDetection('det-004', 22_000, 'siren'),
  makeSoundDetection('det-005', 35_000, 'traffic'),
  makeSoundDetection('det-006', 48_000, 'speech'),
  makeSoundDetection('det-007', 65_000, 'human_voice'),
  makeSoundDetection('det-008', 80_000, 'alarm'),
  makeSoundDetection('det-009', 95_000, 'doorbell'),
  makeSoundDetection('det-010', 120_000, 'background_noise'),
];
