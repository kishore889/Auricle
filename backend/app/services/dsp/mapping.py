"""
Cochlear-inspired channel mapping strategies (Phase B7).
"""
import numpy as np


def apply_mapping_strategy(
    log_energy: np.ndarray,
    strategy: str,
    n_of_m: int = 8
) -> np.ndarray:
    """
    Apply the chosen cochlear implant mapping strategy to log-compressed energy.

    Strategies:
    - cis_inspired: Continuous Interleaved Sampling. Keeps all channels.
    - legacy_map: N-of-M strategy. Only the `n_of_m` highest energy channels
                  are kept, the rest are zeroed out.
    - advanced_spectral: Spectral contrast enhancement. Amplifies peaks relative
                         to their local neighbors.

    Returns:
        np.ndarray: The processed energy vector (same shape as input).
    """
    n_channels = len(log_energy)
    
    if strategy == "legacy_map":
        # N-of-M strategy
        # Find indices of the top N highest energy values
        top_indices = np.argsort(log_energy)[-n_of_m:]
        mapped = np.full_like(log_energy, log_energy.min()) # Fill with minimum (effectively zero after norm)
        mapped[top_indices] = log_energy[top_indices]
        return mapped
        
    elif strategy == "advanced_spectral":
        # Enhance spectral peaks by subtracting a smoothed version (unsharp masking)
        # Using a simple moving average window of 3
        kernel = np.array([1/3, 1/3, 1/3])
        smoothed = np.convolve(log_energy, kernel, mode='same')
        # Edge handling
        smoothed[0] = (log_energy[0] + log_energy[1]) / 2
        smoothed[-1] = (log_energy[-2] + log_energy[-1]) / 2
        
        # Add high-frequency (peak) components back to original signal
        mapped = log_energy + 0.5 * (log_energy - smoothed)
        return mapped
        
    # Default: cis_inspired (no modification to log energy before normalisation)
    return log_energy.copy()
