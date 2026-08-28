"""
Channel activation normalisation for Phase B4.

Maps raw per-channel RMS energy from the gammatone filterbank into the
normalised activation, T-level, and C-level values consumed by the frontend
ChannelActivation schema and rendered in the cochlear simulation visualisation.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Optional

import numpy as np

from app.services.dsp.mapping import apply_mapping_strategy


# ── Per-channel result dataclass ──────────────────────────────────────────────

@dataclass(slots=True)
class ChannelActivationData:
    channel:    int    # 1-based channel index (1 … 22)
    label:      str    # e.g. "CH01"
    activation: float  # 0.0 – 1.0  (normalised)
    tLevel:     int    # 0 – 255  (threshold level — minimum comfort)
    cLevel:     int    # 0 – 255  (comfort level — maximum comfort)
    active:     bool   # True if activation > threshold


# ── Normalisation constants ────────────────────────────────────────────────────

_LOG_FLOOR   = 1e-6     # Avoid log(0)
_ACTIVE_GATE = 0.05     # Channels below this activation are considered silent


def normalize_activations(
    energy_vector: np.ndarray,
    strategy: str = "cis_inspired",
    t_levels: Optional[List[int]] = None,
    c_levels: Optional[List[int]] = None,
) -> List[ChannelActivationData]:
    """
    Convert per-channel RMS energy to normalised activation values.

    Processing steps
    ----------------
    1. Log-compress energy (mimics dB perception).
    2. Apply mapping strategy (N-of-M, advanced_spectral, etc).
    3. Min-max normalise across all channels → [0.0, 1.0].
    4. Derive T-level and C-level using provided per-channel arrays.

    Parameters
    ----------
    energy_vector : np.ndarray  shape (N_channels,), float64
    strategy      : str         Channel mapping strategy
    t_levels      : List[int]   Per-channel threshold levels
    c_levels      : List[int]   Per-channel comfort levels

    Returns
    -------
    List[ChannelActivationData]  length N_channels
    """
    n = len(energy_vector)
    
    if t_levels is None:
        t_levels = [20] * n
    if c_levels is None:
        c_levels = [80] * n

    # Step 1 — log compression
    log_energy = np.log10(np.maximum(energy_vector, _LOG_FLOOR))
    
    # Step 2 — mapping strategy
    mapped_energy = apply_mapping_strategy(log_energy, strategy)

    # Step 3 — min-max normalisation
    e_min, e_max = mapped_energy.min(), mapped_energy.max()
    if e_max - e_min < 1e-9:
        activations = np.zeros(n)
    else:
        activations = (mapped_energy - e_min) / (e_max - e_min)

    # Step 4 — map to output schema
    results: List[ChannelActivationData] = []
    for ch_idx in range(n):
        act = float(np.clip(activations[ch_idx], 0.0, 1.0))
        t   = t_levels[ch_idx]
        c   = c_levels[ch_idx]
        
        # Real-time C-level can vary with activation slightly, but for now we just pass through
        # the base C-level + some visual bump.
        c_vis = int(np.clip(c + int(act * 40), 0, 255))

        results.append(ChannelActivationData(
            channel    = ch_idx + 1,
            label      = f"CH{ch_idx + 1:02d}",
            activation = round(act, 4),
            tLevel     = t,
            cLevel     = c_vis,
            active     = act > _ACTIVE_GATE,
        ))

    return results
