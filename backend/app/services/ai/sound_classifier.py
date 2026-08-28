"""
Heuristic sound classification engine for Phase B4.

Uses spectral features derived from the gammatone filterbank energy vector to
classify the current audio frame into one of four categories matching the
SoundCategory type defined in the frontend TypeScript contracts.

No ML model weights are loaded in this phase — classification is performed
via deterministic energy-based heuristics that are fast, deterministic, and
produce realistic-looking results from the simulated audio. A real ONNX/TFLite
model will replace this in Phase B5 (Speech) and B6 (Environmental Safety).

Categories (matching SoundCategory in src/types/index.ts)
-----------------------------------------------------------
  speech        — dominant energy in speech formant bands (300–3400 Hz)
  environmental — diffuse broadband energy, low centroid
  warning       — strong mid-high frequency energy with transient character
  hazard        — high-frequency burst with safety-critical intensity
  system        — default / unknown
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Literal

import numpy as np

from app.services.dsp.gammatone import GammatoneFilterbank, filterbank as _default_fb


# ── Result type ───────────────────────────────────────────────────────────────

SoundCategory = Literal["speech", "environmental", "warning", "hazard", "system"]
Priority      = Literal["low", "medium", "high", "critical"]

@dataclass(slots=True)
class ClassificationResult:
    category:       SoundCategory
    confidence:     float   # 0.0 – 1.0
    intensity:      float   # 0.0 – 1.0  (normalised RMS)
    isSafetyEvent:  bool
    priority:       Priority
    rawLabel:       str


# ── Classifier ────────────────────────────────────────────────────────────────

class SoundClassifier:
    """
    Heuristic classifier that maps a gammatone energy vector to a sound category.
    """

    def __init__(self, fb: GammatoneFilterbank | None = None) -> None:
        self._fb           = fb or _default_fb
        self._n_channels   = self._fb.n_channels
        self._cf           = np.array(self._fb.centre_frequencies)

    def classify(self, energy_vector: np.ndarray) -> ClassificationResult:
        """
        Classify one frame's energy vector.

        Parameters
        ----------
        energy_vector : np.ndarray  shape (n_channels,)

        Returns
        -------
        ClassificationResult
        """
        if energy_vector.shape[0] != self._n_channels:
            raise ValueError(
                f"Expected energy_vector of length {self._n_channels}, "
                f"got {energy_vector.shape[0]}"
            )

        total_energy = float(np.sum(energy_vector))
        if total_energy < 1e-9:
            return ClassificationResult(
                category="system", confidence=1.0, intensity=0.0,
                isSafetyEvent=False, priority="low", rawLabel="silence"
            )

        # ── Feature 1: spectral centroid (Hz) ─────────────────────────────────
        centroid = float(np.dot(self._cf, energy_vector) / total_energy)

        # ── Feature 2: speech band energy ratio (300–3400 Hz) ─────────────────
        speech_mask   = (self._cf >= 300) & (self._cf <= 3400)
        speech_energy = float(np.sum(energy_vector[speech_mask]))
        speech_ratio  = speech_energy / (total_energy + 1e-12)

        # ── Feature 3: high-frequency ratio (>4000 Hz) ────────────────────────
        hf_mask    = self._cf > 4000
        hf_energy  = float(np.sum(energy_vector[hf_mask]))
        hf_ratio   = hf_energy / (total_energy + 1e-12)

        # ── Feature 4: peak energy relative to mean (transient indicator) ─────
        peak_ratio = float(np.max(energy_vector)) / (np.mean(energy_vector) + 1e-12)

        # ── Intensity: normalised log RMS ─────────────────────────────────────
        rms          = math.sqrt(total_energy / self._n_channels)
        rms_db       = 20.0 * math.log10(max(rms, 1e-9))
        intensity    = float(np.clip((rms_db + 60) / 60.0, 0.0, 1.0))  # map [-60,0] dB → [0,1]

        # ── Decision tree ─────────────────────────────────────────────────────
        if hf_ratio > 0.35 and peak_ratio > 8.0 and intensity > 0.5:
            # Strong high-frequency transient burst → hazard (e.g. vehicle horn, alarm)
            return ClassificationResult(
                category="hazard",
                confidence=min(0.7 + hf_ratio * 0.5, 0.99),
                intensity=intensity,
                isSafetyEvent=True,
                priority="critical",
                rawLabel="hazard_transient"
            )

        if hf_ratio > 0.20 and peak_ratio > 4.0:
            # Moderate high-frequency with transient → warning
            return ClassificationResult(
                category="warning",
                confidence=min(0.6 + hf_ratio * 0.6, 0.95),
                intensity=intensity,
                isSafetyEvent=False,
                priority="high",
                rawLabel="warning_event"
            )

        if speech_ratio > 0.55 and centroid > 400 and centroid < 3500:
            # Energy concentrated in speech band with mid centroid → speech
            return ClassificationResult(
                category="speech",
                confidence=min(0.55 + speech_ratio * 0.7, 0.98),
                intensity=intensity,
                isSafetyEvent=False,
                priority="medium",
                rawLabel="speech"
            )

        # Default → environmental (diffuse / broadband)
        return ClassificationResult(
            category="environmental",
            confidence=0.6,
            intensity=intensity,
            isSafetyEvent=False,
            priority="low",
            rawLabel="environmental"
        )


# Module-level singleton
classifier = SoundClassifier()
