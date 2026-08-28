"""
Hardware Manager (Phase B8).

Tracks the ESP32 connection state and holds an audio ring buffer for incoming PCM data.
"""
import time
from collections import deque
from datetime import datetime, timezone
from threading import Lock
from typing import Optional

import numpy as np

from app.schemas.device import Device, DeviceStatus

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")


class AudioRingBuffer:
    """
    A simple thread-safe buffer for raw float32 audio samples.
    ESP32 pushes chunks asynchronously; DSP loop pops exactly FRAME_SIZE samples synchronously.
    """
    def __init__(self, max_samples: int = 16000 * 5): # 5 seconds of 16kHz
        self._lock = Lock()
        self._buffer = deque(maxlen=max_samples)

    def push(self, samples: np.ndarray):
        with self._lock:
            # Flatten and extend
            self._buffer.extend(samples.flatten().tolist())

    def pop(self, n: int) -> Optional[np.ndarray]:
        """Pop exactly n samples. Returns None if not enough samples available."""
        with self._lock:
            if len(self._buffer) < n:
                return None
            
            # Pop n items from the left
            out = [self._buffer.popleft() for _ in range(n)]
            return np.array(out, dtype=np.float32)

    def clear(self):
        with self._lock:
            self._buffer.clear()
            
    def __len__(self):
        with self._lock:
            return len(self._buffer)


class HardwareManager:
    """
    Thread-safe tracker for ESP32 hardware state.
    """
    def __init__(self):
        self._lock = Lock()
        self.audio_buffer = AudioRingBuffer()
        
        self._connected: bool = False
        self._last_heartbeat: Optional[str] = None
        self._microphone_active: bool = False
        
    def set_connected(self, connected: bool):
        with self._lock:
            self._connected = connected
            if not connected:
                self._microphone_active = False
                self.audio_buffer.clear()
            else:
                self._last_heartbeat = _utcnow()
                
    def is_connected(self) -> bool:
        with self._lock:
            return self._connected
            
    def record_heartbeat(self, microphone_active: bool = True):
        with self._lock:
            self._connected = True
            self._last_heartbeat = _utcnow()
            self._microphone_active = microphone_active

    def get_info(self) -> Device:
        return Device(
            id="ESP32-AURICLE-LIVE",
            name="Auricle ESP32 Prototype",
            type="esp32_c3",
            firmwareVersion="0.4.0-live",
            connectedAt=self._last_heartbeat or _utcnow(),
        )

    def get_status(self) -> DeviceStatus:
        with self._lock:
            mic_state = "sampling" if self._microphone_active else ("disconnected" if not self._connected else "idle")
            health    = "healthy" if self._connected else "offline"
            
            return DeviceStatus(
                esp32Connected=self._connected,
                esp32Id="ESP32-AURICLE-LIVE" if self._connected else None,
                esp32LastHeartbeat=self._last_heartbeat,
                microphoneActive=self._microphone_active,
                microphoneInputState=mic_state,
                microphoneLastUpdate=self._last_heartbeat,
                aiEngineState="running",
                dspEngineState="running",
                ledArrayActive=self._connected,
                ledArrayChannels=22,
                serialCommunicationOk=self._connected,
                backendRestStatus="connected",
                backendWsStatus="connected",
                overallHealth=health,
                lastUpdated=_utcnow(),
            )
