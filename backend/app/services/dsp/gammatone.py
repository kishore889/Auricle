"""
Gammatone filterbank for cochlear-inspired frequency decomposition.

Implements a 22-channel gammatone filterbank covering 200 Hz – 8000 Hz on an
ERB (Equivalent Rectangular Bandwidth) frequency scale, approximating the
tonotopic organisation of the human cochlea.

Each channel uses a 4th-order IIR gammatone filter designed via SciPy,
following the Malcolm Slaney APES (1993) all-pole gammatone filter model.

References
----------
- Slaney, M. (1993). An Efficient Implementation of the Patterson-Holdsworth
  Auditory Filter Bank. Apple TR #35.
- Moore, B. C. J. & Glasberg, B. R. (1983). Suggested formulae for calculating
  auditory-filter bandwidths and excitation patterns. JASA 74(3):750-753.
"""
import math
from dataclasses import dataclass, field
from typing import List, Tuple

import numpy as np
from scipy import signal as sp_signal


# ── ERB-scale helpers ─────────────────────────────────────────────────────────

def hz_to_erb(f: float) -> float:
    """Convert frequency *f* (Hz) to ERB-rate (Cams)."""
    return 21.4 * math.log10(0.00437 * f + 1)


def erb_to_hz(e: float) -> float:
    """Convert ERB-rate *e* (Cams) to frequency (Hz)."""
    return (10 ** (e / 21.4) - 1) / 0.00437


def erb_bw(f: float) -> float:
    """Return ERB bandwidth at centre frequency *f* (Hz)."""
    return 24.7 * (4.37 * f / 1000.0 + 1.0)


def erb_space(f_low: float, f_high: float, n: int) -> List[float]:
    """Return *n* centre frequencies equally spaced on the ERB scale."""
    e_low  = hz_to_erb(f_low)
    e_high = hz_to_erb(f_high)
    return [erb_to_hz(e_low + i * (e_high - e_low) / (n - 1)) for i in range(n)]


# ── Single-channel filter builder ─────────────────────────────────────────────

def _gammatone_iir(cf: float, sample_rate: int) -> Tuple[np.ndarray, np.ndarray]:
    """
    Design a 4th-order IIR approximation of a gammatone filter at centre
    frequency *cf* using the bilinear transform of the s-domain all-pole model.
    Returns (b, a) coefficients for scipy.signal.sosfilt.
    """
    order = 4
    bw    = 1.019 * erb_bw(cf)         # 3-dB bandwidth

    # Analytic all-pole bandwidth in rad/s
    B  = 2 * math.pi * bw
    cf_rad = 2 * math.pi * cf

    # Pre-warp for bilinear transform
    T  = 1.0 / sample_rate
    A  = -2.0 * math.exp(-B * T) * math.cos(cf_rad * T)
    B2 = math.exp(-2.0 * B * T)

    # 2nd-order section repeated *order/2* times (each pole pair)
    sos_single = [1.0, A, B2]          # denominator (one pole pair)
    b = np.array([1.0])
    a = np.polymul(sos_single, sos_single)  # 4th-order denominator

    # Normalise gain at CF
    w_cf  = 2 * math.pi * cf / sample_rate
    z_cf  = math.e ** (1j * w_cf)
    H_cf  = 1.0 / np.polyval(a[::-1], z_cf)
    b_norm = np.array([abs(H_cf) ** (-1)])

    # Convert to SOS for numerical stability
    system = sp_signal.tf2sos(b_norm, a)
    return system


# ── Filterbank class ──────────────────────────────────────────────────────────

@dataclass
class GammatoneFilterbank:
    """
    22-channel gammatone filterbank covering the cochlear frequency range.
    Designed for real-time per-frame processing.
    """
    n_channels:  int   = 22
    f_low:       float = 200.0     # Hz
    f_high:      float = 8000.0    # Hz
    sample_rate: int   = 16_000

    # Derived on first use
    _centre_freqs: List[float] = field(default_factory=list, repr=False, init=False)
    _sos_filters:  List[np.ndarray] = field(default_factory=list, repr=False, init=False)

    def __post_init__(self):
        self._centre_freqs = erb_space(self.f_low, self.f_high, self.n_channels)
        self._sos_filters  = [
            _gammatone_iir(cf, self.sample_rate)
            for cf in self._centre_freqs
        ]

    @property
    def centre_frequencies(self) -> List[float]:
        return self._centre_freqs

    def process(self, frame: np.ndarray) -> np.ndarray:
        """
        Filter *frame* through all channels and return per-channel RMS energy.

        Parameters
        ----------
        frame : np.ndarray  shape (N,), float32

        Returns
        -------
        np.ndarray  shape (n_channels,), float64, per-channel RMS energy ≥ 0
        """
        if frame.ndim != 1:
            raise ValueError(f"Expected 1-D frame, got shape {frame.shape}")

        energies = np.empty(self.n_channels, dtype=np.float64)
        for ch, sos in enumerate(self._sos_filters):
            filtered      = sp_signal.sosfilt(sos, frame.astype(np.float64))
            energies[ch]  = float(np.sqrt(np.mean(filtered ** 2)))

        return energies


# Module-level singleton — constructed once at import time
filterbank = GammatoneFilterbank()
