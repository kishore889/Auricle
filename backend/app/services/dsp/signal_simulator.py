"""
Audio signal simulator for Phase B4.

Generates a realistic, time-evolving synthetic audio frame that approximates
a mixed environment (speech formants + environmental hum + occasional transients).
No real microphone hardware is needed in this phase — that comes in B8.
"""
import math
import numpy as np


# ── Public constants ──────────────────────────────────────────────────────────
SAMPLE_RATE = 16_000   # Hz
FRAME_SIZE  = 800      # 50 ms at 16 kHz


def generate_frame(t: float, sample_rate: int = SAMPLE_RATE, frame_size: int = FRAME_SIZE) -> np.ndarray:
    """
    Generate one audio frame centred at time *t* (seconds since epoch or app start).

    The signal slowly cycles through three "environment" regimes using a
    low-frequency modulator so the frontend visualisation appears naturally
    dynamic rather than static.

    Returns
    -------
    np.ndarray  shape (frame_size,), dtype float32, values in [-1.0, 1.0]
    """
    t_arr = np.linspace(t, t + frame_size / sample_rate, frame_size, dtype=np.float32, endpoint=False)

    # ── Slow environment modulator (8-second cycle) ──────────────────────────
    env_phase  = (t % 8.0) / 8.0                 # 0 → 1 over 8 s
    speech_amp = 0.5 + 0.4 * math.sin(2 * math.pi * env_phase)
    noise_amp  = 0.1 + 0.15 * math.cos(2 * math.pi * env_phase * 2)

    # ── Speech-like formant component (F1≈700 Hz, F2≈1200 Hz, F3≈2500 Hz) ──
    f1 = 700.0 + 80.0 * math.sin(2 * math.pi * t / 3.0)   # drift
    f2 = 1200.0 + 150.0 * math.cos(2 * math.pi * t / 5.0)
    f3 = 2500.0 + 200.0 * math.sin(2 * math.pi * t / 7.0)

    speech = (
        0.5 * np.sin(2 * np.pi * f1 * t_arr) +
        0.3 * np.sin(2 * np.pi * f2 * t_arr) +
        0.2 * np.sin(2 * np.pi * f3 * t_arr)
    )
    speech *= speech_amp

    # ── Low-frequency environmental hum (60 Hz) ──────────────────────────────
    hum = 0.08 * np.sin(2 * np.pi * 60.0 * t_arr)

    # ── Shaped Gaussian noise (broadband environmental) ───────────────────────
    rng   = np.random.default_rng(seed=int(t * 1000) % (2**31))
    noise = rng.standard_normal(frame_size).astype(np.float32) * noise_amp

    # ── Occasional transient burst (vehicle horn / clap simulation) ───────────
    transient = np.zeros(frame_size, dtype=np.float32)
    if (int(t * 10) % 47) == 0:                 # fires roughly every ~4.7 s
        burst_len = min(frame_size, 160)
        env_win   = np.hanning(burst_len).astype(np.float32)
        burst_sig = 0.9 * rng.standard_normal(burst_len).astype(np.float32) * env_win
        offset    = rng.integers(0, frame_size - burst_len)
        transient[offset : offset + burst_len] = burst_sig

    frame = speech + hum + noise + transient

    # ── Normalise to [-1, 1] ──────────────────────────────────────────────────
    peak = np.max(np.abs(frame))
    if peak > 1e-6:
        frame /= peak

    return frame.astype(np.float32)


def rms_db(frame: np.ndarray) -> tuple[float, float]:
    """Return (rms_linear 0-1, rms_dB) for *frame*."""
    rms = float(np.sqrt(np.mean(frame ** 2)))
    db  = 20.0 * math.log10(max(rms, 1e-9))
    return rms, db
