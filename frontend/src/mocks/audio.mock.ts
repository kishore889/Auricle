import type { AudioFrame, AudioStatus } from '../types';

export const mockAudioStatus: AudioStatus = {
  isMonitoring: true,
  processingState: 'running',
  sampleRate: 16000,
  signalLevel: 0.42,
  signalLevelDb: -7.5,
  inputConnected: true,
  enhancementActive: true,
  latencyMs: 28,
};

/**
 * Generate a mock audio frame with simulated waveform samples.
 * Each call returns a new frame with slight variation.
 */
export function generateMockAudioFrame(frameIndex: number): AudioFrame {
  const SAMPLE_COUNT = 256;
  const samples: number[] = Array.from({ length: SAMPLE_COUNT }, (_, i) => {
    const t = (i + frameIndex * SAMPLE_COUNT) / 16000;
    // Simulate a speech-like composite signal
    const fundamental = Math.sin(2 * Math.PI * 200 * t) * 0.4;
    const harmonic2 = Math.sin(2 * Math.PI * 400 * t) * 0.2;
    const harmonic3 = Math.sin(2 * Math.PI * 800 * t) * 0.1;
    const noise = (Math.random() - 0.5) * 0.06;
    return Math.max(-1, Math.min(1, fundamental + harmonic2 + harmonic3 + noise));
  });

  const rms = Math.sqrt(samples.reduce((acc, s) => acc + s * s, 0) / samples.length);
  const signalLevel = Math.min(1, rms * 2.5);

  return {
    timestamp: Date.now() / 1000,
    samples,
    sampleRate: 16000,
    signalLevel,
    signalLevelDb: signalLevel > 0 ? 20 * Math.log10(signalLevel) : -Infinity,
    speechDetected: signalLevel > 0.15,
    speechConfidence: Math.min(1, signalLevel * 1.8),
    processingState: 'running',
    frameIndex,
  };
}
