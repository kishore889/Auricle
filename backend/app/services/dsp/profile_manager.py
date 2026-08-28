"""
Channel Profile Manager (Phase B7).

Holds the active mapping strategy and T/C level state in-memory so that
the DSP telemetry loop and REST API operate on the same source of truth.
"""
from datetime import datetime, timezone
from threading import Lock
from typing import Optional

from app.schemas.channels import ChannelProfile, ChannelActivation, ChannelStrategy


def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")


def _create_default_profile() -> ChannelProfile:
    activations = []
    for i in range(1, 23):
        activations.append(
            ChannelActivation(
                channel=i,
                label=f"CH{i:02d}",
                activation=0.0,
                tLevel=20,
                cLevel=80,
                active=True
            )
        )
    return ChannelProfile(
        id="profile-live-001",
        name="Research Default",
        strategy="cis_inspired",
        totalChannels=22,
        activeChannels=22,
        activations=activations,
        lastUpdated=_utcnow(),
        sessionId="session-live-001",
    )


class ChannelProfileManager:
    """
    Thread-safe, in-memory global channel profile state.
    """

    def __init__(self):
        self._lock = Lock()
        self._profile: ChannelProfile = _create_default_profile()

    def get_profile(self) -> ChannelProfile:
        with self._lock:
            # Return a shallow copy if we don't want external mutation,
            # but Pydantic BaseModel handles its own copying if needed.
            # Returning the object itself is fine since FastAPI will serialize it.
            return self._profile.model_copy(deep=True)

    def get_active_strategy(self) -> ChannelStrategy:
        """Fast path for DSP loop."""
        with self._lock:
            return self._profile.strategy

    def get_tc_levels(self) -> tuple[list[int], list[int]]:
        """Return (T_levels, C_levels) for all 22 channels."""
        with self._lock:
            t = [a.tLevel for a in self._profile.activations]
            c = [a.cLevel for a in self._profile.activations]
            return t, c

    def update_profile(self, name: Optional[str] = None, strategy: Optional[ChannelStrategy] = None) -> ChannelProfile:
        with self._lock:
            if name:
                self._profile.name = name
            if strategy:
                self._profile.strategy = strategy
            
            self._profile.lastUpdated = _utcnow()
            return self._profile.model_copy(deep=True)
