"""
Tests for Phase B7 — Channel Mapping & Profile Management
"""
import numpy as np

from app.services.dsp.mapping import apply_mapping_strategy
from app.services.dsp.profile_manager import ChannelProfileManager


def test_mapping_cis_inspired():
    energy = np.array([10.0, 5.0, 20.0, 15.0])
    # cis_inspired does nothing to the log energy vector before normalization
    mapped = apply_mapping_strategy(energy, "cis_inspired")
    np.testing.assert_array_equal(energy, mapped)


def test_mapping_legacy_map_n_of_m():
    # 10 channels, n_of_m = 4
    energy = np.array([1, 2, 3, 4, 10, 9, 8, 7, 5, 6], dtype=float)
    mapped = apply_mapping_strategy(energy, "legacy_map", n_of_m=4)
    
    # Top 4 are: 10, 9, 8, 7
    # Minimum is 1
    # So the others should be 1
    assert mapped[4] == 10
    assert mapped[5] == 9
    assert mapped[6] == 8
    assert mapped[7] == 7
    
    assert mapped[0] == 1
    assert mapped[1] == 1
    assert mapped[2] == 1
    assert mapped[3] == 1
    assert mapped[8] == 1
    assert mapped[9] == 1


def test_mapping_advanced_spectral():
    # Peak enhancement
    energy = np.array([5.0, 10.0, 5.0])
    mapped = apply_mapping_strategy(energy, "advanced_spectral")
    
    # Manual unsharp mask
    # kernel [1/3, 1/3, 1/3]
    # edges: smoothed[0] = (5+10)/2 = 7.5
    #        smoothed[1] = (5+10+5)/3 = 6.666
    #        smoothed[2] = (10+5)/2 = 7.5
    # mapped = energy + 0.5 * (energy - smoothed)
    # mapped[1] = 10 + 0.5 * (10 - 6.666) = 10 + 1.666 = 11.666
    
    assert mapped[1] > 11.0
    assert mapped[0] < 5.0  # (5 + 0.5 * (5 - 7.5)) = 3.75


def test_profile_manager_lifecycle():
    manager = ChannelProfileManager()
    
    profile = manager.get_profile()
    assert profile.strategy == "cis_inspired"
    assert len(profile.activations) == 22
    
    # Test fast path
    assert manager.get_active_strategy() == "cis_inspired"
    
    # Test get T/C levels
    t, c = manager.get_tc_levels()
    assert len(t) == 22
    assert len(c) == 22
    assert t[0] == 20
    assert c[0] == 80
    
    # Update profile
    updated = manager.update_profile(name="New Profile", strategy="legacy_map")
    assert updated.strategy == "legacy_map"
    assert updated.name == "New Profile"
    
    # Verify global state updated
    assert manager.get_active_strategy() == "legacy_map"
