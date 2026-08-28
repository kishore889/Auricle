import type { SpeechResult } from '../types';

export const mockCurrentSpeech: SpeechResult = {
  id: 'speech-current',
  timestamp: new Date().toISOString(),
  speechDetected: true,
  confidence: 0.88,
  transcriptionPlaceholder: '[Speech detected — transcription pending backend STT]',
  processingState: 'running',
  durationMs: 1240,
};

export const mockSpeechHistory: SpeechResult[] = [
  {
    id: 'speech-001',
    timestamp: new Date(Date.now() - 5_000).toISOString(),
    speechDetected: true,
    confidence: 0.91,
    transcriptionPlaceholder: null,
    processingState: 'running',
    durationMs: 850,
  },
  {
    id: 'speech-002',
    timestamp: new Date(Date.now() - 12_000).toISOString(),
    speechDetected: false,
    confidence: 0.12,
    transcriptionPlaceholder: null,
    processingState: 'running',
    durationMs: null,
  },
  {
    id: 'speech-003',
    timestamp: new Date(Date.now() - 28_000).toISOString(),
    speechDetected: true,
    confidence: 0.79,
    transcriptionPlaceholder: null,
    processingState: 'running',
    durationMs: 2100,
  },
];
