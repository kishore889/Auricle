"""
Phase B4 — DSP + AI pipeline unit tests.
"""
import math
import numpy as np
import pytest

from app.services.dsp.signal_simulator import (
    generate_frame, rms_db, SAMPLE_RATE, FRAME_SIZE
)
from app.services.dsp.gammatone import (
    GammatoneFilterbank, hz_to_erb, erb_to_hz, erb_bw, erb_space
)
from app.services.dsp.normalization import normalize_activations, ChannelActivationData
from app.services.ai.sound_classifier import SoundClassifier, SoundCategory


# ── Signal Simulator ─────────────────────────────────────────────────────────

class TestSignalSimulator:

    def test_frame_shape(self):
        frame = generate_frame(0.0)
        assert frame.shape == (FRAME_SIZE,)

    def test_frame_dtype(self):
        frame = generate_frame(0.0)
        assert frame.dtype == np.float32

    def test_frame_normalised(self):
        frame = generate_frame(0.0)
        assert float(np.max(np.abs(frame))) <= 1.0 + 1e-6

    def test_frame_not_silent(self):
        frame = generate_frame(0.0)
        assert float(np.max(np.abs(frame))) > 0.01

    def test_frame_evolves_over_time(self):
        f1 = generate_frame(0.0)
        f2 = generate_frame(1.0)
        # Frames at different times should differ significantly
        assert float(np.mean(np.abs(f1 - f2))) > 1e-4

    def test_custom_frame_size(self):
        frame = generate_frame(0.0, frame_size=1600)
        assert frame.shape == (1600,)

    def test_rms_db_silent(self):
        silent = np.zeros(FRAME_SIZE, dtype=np.float32)
        rms, db = rms_db(silent)
        assert rms < 1e-5
        assert db < -100

    def test_rms_db_full_scale(self):
        full = np.ones(FRAME_SIZE, dtype=np.float32)
        rms, db = rms_db(full)
        assert abs(rms - 1.0) < 1e-4
        assert abs(db) < 0.1   # ~0 dB


# ── ERB helpers ──────────────────────────────────────────────────────────────

class TestERBHelpers:

    def test_hz_to_erb_roundtrip(self):
        for f in [200, 500, 1000, 4000, 8000]:
            assert abs(erb_to_hz(hz_to_erb(f)) - f) < 0.1

    def test_erb_space_length(self):
        cfs = erb_space(200, 8000, 22)
        assert len(cfs) == 22

    def test_erb_space_monotonic(self):
        cfs = erb_space(200, 8000, 22)
        assert all(cfs[i] < cfs[i+1] for i in range(len(cfs)-1))

    def test_erb_space_bounds(self):
        cfs = erb_space(200, 8000, 22)
        assert abs(cfs[0] - 200) < 1.0
        assert abs(cfs[-1] - 8000) < 1.0

    def test_erb_bw_increases(self):
        # ERB bandwidth should increase with frequency
        assert erb_bw(1000) < erb_bw(4000)


# ── Gammatone Filterbank ─────────────────────────────────────────────────────

class TestGammatoneFilterbank:

    @pytest.fixture(scope="class")
    def fb(self):
        return GammatoneFilterbank(n_channels=22, f_low=200, f_high=8000, sample_rate=16000)

    def test_centre_freq_count(self, fb):
        assert len(fb.centre_frequencies) == 22

    def test_centre_freq_range(self, fb):
        cfs = fb.centre_frequencies
        assert cfs[0] >= 190
        assert cfs[-1] <= 8100

    def test_process_output_shape(self, fb):
        frame  = generate_frame(0.0)
        energy = fb.process(frame)
        assert energy.shape == (22,)

    def test_process_nonnegative(self, fb):
        frame  = generate_frame(0.0)
        energy = fb.process(frame)
        assert float(np.min(energy)) >= 0.0

    def test_process_nonzero(self, fb):
        frame  = generate_frame(0.0)
        energy = fb.process(frame)
        assert float(np.sum(energy)) > 1e-6

    def test_process_rejects_2d(self, fb):
        with pytest.raises(ValueError, match="1-D"):
            fb.process(np.zeros((22, 100)))

    def test_sine_energy_at_cf(self, fb):
        """A pure sine at the 5th channel CF should produce peak energy there."""
        cf    = fb.centre_frequencies[4]      # 5th channel
        t     = np.arange(FRAME_SIZE) / SAMPLE_RATE
        sine  = np.sin(2 * math.pi * cf * t).astype(np.float32)
        energy = fb.process(sine)
        peak_ch = int(np.argmax(energy))
        # Peak should be within 2 channels of target
        assert abs(peak_ch - 4) <= 2


# ── Normalisation ─────────────────────────────────────────────────────────────

class TestNormalization:

    def _sample_energy(self):
        frame  = generate_frame(0.0)
        return GammatoneFilterbank().process(frame)

    def test_output_length(self):
        energy = self._sample_energy()
        result = normalize_activations(energy)
        assert len(result) == 22

    def test_activation_range(self):
        energy = self._sample_energy()
        for ch in normalize_activations(energy):
            assert 0.0 <= ch.activation <= 1.0

    def test_t_level_range(self):
        energy = self._sample_energy()
        for ch in normalize_activations(energy):
            assert 0 <= ch.tLevel <= 255

    def test_c_level_range(self):
        energy = self._sample_energy()
        for ch in normalize_activations(energy):
            assert 0 <= ch.cLevel <= 255

    def test_labels(self):
        energy = self._sample_energy()
        for i, ch in enumerate(normalize_activations(energy)):
            assert ch.label == f"CH{i+1:02d}"
            assert ch.channel == i + 1

    def test_zero_energy(self):
        zero = np.zeros(22)
        result = normalize_activations(zero)
        assert all(ch.activation == 0.0 for ch in result)

    def test_uniform_energy(self):
        uniform = np.ones(22)
        result  = normalize_activations(uniform)
        # With uniform energy all activations should be equal
        acts = [ch.activation for ch in result]
        assert max(acts) - min(acts) < 1e-6


# ── Sound Classifier ─────────────────────────────────────────────────────────

class TestSoundClassifier:

    @pytest.fixture(scope="class")
    def clf(self):
        return SoundClassifier()

    def _live_energy(self):
        frame  = generate_frame(0.0)
        return GammatoneFilterbank().process(frame)

    def test_live_frame_returns_category(self, clf):
        energy = self._live_energy()
        result = clf.classify(energy)
        valid_cats = {"speech", "environmental", "warning", "hazard", "system"}
        assert result.category in valid_cats

    def test_confidence_range(self, clf):
        energy = self._live_energy()
        result = clf.classify(energy)
        assert 0.0 <= result.confidence <= 1.0

    def test_intensity_range(self, clf):
        energy = self._live_energy()
        result = clf.classify(energy)
        assert 0.0 <= result.intensity <= 1.0

    def test_silence_returns_system(self, clf):
        result = clf.classify(np.zeros(22))
        assert result.category == "system"
        assert result.intensity == 0.0
        assert result.isSafetyEvent is False

    def test_high_hf_burst_hazard(self, clf):
        """Injecting high high-frequency energy should trigger hazard."""
        energy           = np.zeros(22)
        energy[18:]      = 5.0   # Top 4 channels (>4 kHz) — strong burst
        energy[0:5]      = 0.001 # Low channels silent
        result = clf.classify(energy)
        # With strong HF burst and high peak ratio we expect hazard or warning
        assert result.category in ("hazard", "warning")

    def test_speech_band_energy_speech_category(self, clf):
        """Injecting energy mainly in speech-band channels should yield speech."""
        fb     = GammatoneFilterbank()
        cf     = np.array(fb.centre_frequencies)
        energy = np.zeros(22)
        # Channels whose CF is in 400–2500 Hz range
        mask   = (cf >= 400) & (cf <= 2500)
        energy[mask] = 2.0
        result = clf.classify(energy)
        assert result.category in ("speech", "environmental")

    def test_wrong_size_raises(self, clf):
        with pytest.raises(ValueError, match="length 22"):
            clf.classify(np.zeros(10))
