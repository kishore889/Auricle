"""
WebSocket Connection Manager with real DSP telemetry loop (Phase B4).

The manager:
  1. Tracks all active WebSocket client connections.
  2. Runs a background asyncio task that:
       a. Generates a synthetic audio frame every 50 ms.
       b. Dispatches gammatone filterbank processing to a ThreadPoolExecutor
          (CPU-bound DSP must not block the event loop).
       c. Runs the heuristic sound classifier.
       d. Broadcasts live `audio_update`, `channel_update`, and
          `sound_detection` WebSocket events at up to 20 Hz.
       e. Broadcasts `device_status` and `system_status` once per second.
"""
import asyncio
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from typing import List

from fastapi import WebSocket

from app.core.logging import logger
from app.services.dsp.signal_simulator import generate_frame, rms_db, SAMPLE_RATE, FRAME_SIZE
from app.services.dsp.gammatone import filterbank
from app.services.dsp.normalization import normalize_activations
from app.services.ai.sound_classifier import classifier
from app.services.ai.sound_classifier import classifier
from app.state import safety_manager, profile_manager, hardware_manager

# Thread pool for CPU-bound DSP (gammatone filtering)
_EXECUTOR = ThreadPoolExecutor(max_workers=2, thread_name_prefix="auricle-dsp")

# How often to emit different message types
_FRAME_INTERVAL   = 0.05   # 50 ms  → ~20 Hz  for audio / channel updates
_STATUS_INTERVAL  = 1.0    # 1 Hz   for device / system status
_DETECT_INTERVAL  = 1.0    # 1 Hz   for sound_detection


def _dsp_work(t: float, strategy: str, t_levels: list[int], c_levels: list[int], audio_frame: np.ndarray | None = None):
    """CPU-bound work executed in the thread pool."""
    if audio_frame is not None:
        frame = audio_frame
    else:
        frame = generate_frame(t, SAMPLE_RATE, FRAME_SIZE)
        
    energy = filterbank.process(frame)
    acts   = normalize_activations(energy, strategy=strategy, t_levels=t_levels, c_levels=c_levels)
    result = classifier.classify(energy)
    signal_level, signal_db = rms_db(frame)
    return frame, energy, acts, result, signal_level, signal_db


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._running    = False
        self._task: asyncio.Task | None = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WS client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WS client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"WS send failed: {e}")
                self.disconnect(connection)

    # ── Background DSP telemetry loop ────────────────────────────────────────

    async def _dsp_telemetry_loop(self):
        logger.info("DSP telemetry loop starting.")
        loop                 = asyncio.get_event_loop()
        last_status_time     = 0.0
        last_detect_time     = 0.0
        detection_id_counter = 0

        while self._running:
            if not self.active_connections:
                await asyncio.sleep(_FRAME_INTERVAL)
                continue

            t_now = time.time()

            try:
                # Fetch live mapping strategy
                strategy = profile_manager.get_active_strategy()
                t_levels, c_levels = profile_manager.get_tc_levels()

                # Check hardware manager for live audio
                audio_frame = None
                if hardware_manager.is_connected():
                    # Attempt to pop exactly FRAME_SIZE samples
                    popped = hardware_manager.audio_buffer.pop(FRAME_SIZE)
                    if popped is not None:
                        audio_frame = popped

                # Run CPU-bound DSP in thread pool
                _, _, acts, result, signal_level, signal_db = await loop.run_in_executor(
                    _EXECUTOR, _dsp_work, t_now, strategy, t_levels, c_levels, audio_frame
                )
            except Exception as exc:
                logger.error(f"DSP error: {exc}")
                await asyncio.sleep(_FRAME_INTERVAL)
                continue

            ts_ms = int(t_now)

            # ── 1. audio_update (every frame ~20 Hz) ─────────────────────────
            await self.broadcast({
                "type": "audio_update",
                "timestamp": ts_ms,
                "payload": {
                    "signalLevel":      round(signal_level, 4),
                    "signalLevelDb":    round(signal_db, 2),
                    "speechDetected":   result.category == "speech",
                    "speechConfidence": round(result.confidence, 3) if result.category == "speech" else 0.0,
                    "processingState":  "running",
                }
            })

            # ── 2. channel_update (every frame ~20 Hz) ────────────────────────
            await self.broadcast({
                "type": "channel_update",
                "timestamp": ts_ms,
                "payload": {
                    "channels": [
                        {
                            "channel":    a.channel,
                            "activation": a.activation,
                            "tLevel":     a.tLevel,
                            "cLevel":     a.cLevel,
                        }
                        for a in acts
                    ],
                    "strategy":      strategy,
                    "activeChannels": sum(1 for a in acts if a.active),
                }
            })

            # ── 3. sound_detection & safety processing (1 Hz) ────────────────
            if t_now - last_detect_time >= _DETECT_INTERVAL:
                last_detect_time     += _DETECT_INTERVAL
                detection_id_counter += 1
                
                # Emit standard sound detection event
                await self.broadcast({
                    "type": "sound_detection",
                    "timestamp": ts_ms,
                    "payload": {
                        "id":          f"det-live-{detection_id_counter:05d}",
                        "category":    result.category,
                        "confidence":  round(result.confidence, 3),
                        "intensity":   round(result.intensity, 3),
                        "priority":    result.priority,
                        "isSafetyEvent": result.isSafetyEvent,
                    }
                })

                # Process through safety manager
                safety_manager.process(result)
                
                # Pop and broadcast any new/cleared safety events
                new_events, cleared_events = safety_manager.pop_new_events()
                
                for ev in new_events:
                    # Broadcast safety_event
                    await self.broadcast({
                        "type": "safety_event",
                        "timestamp": ts_ms,
                        "payload": ev.as_dict()
                    })
                    # Broadcast matching alert
                    alert_record = safety_manager.get_alert(ev.id.replace("safe-", "alt-"))
                    if alert_record:
                        await self.broadcast({
                            "type": "alert",
                            "timestamp": ts_ms,
                            "payload": alert_record.as_dict()
                        })
                        
                for ev in cleared_events:
                    # Broadcast cleared safety_event
                    await self.broadcast({
                        "type": "safety_event",
                        "timestamp": ts_ms,
                        "payload": ev.as_dict()
                    })
                    # We could broadcast an updated alert here, but the contract usually expects frontend to poll or just receive the initial alert via WS. 
                    # If we need to send alert updates, we could broadcast it similarly.
                    alert_record = safety_manager.get_alert(ev.id.replace("safe-", "alt-"))
                    if alert_record:
                        await self.broadcast({
                            "type": "alert",
                            "timestamp": ts_ms,
                            "payload": alert_record.as_dict()
                        })

            # ── 4. device_status + system_status (1 Hz) ──────────────────────
            if t_now - last_status_time >= _STATUS_INTERVAL:
                last_status_time += _STATUS_INTERVAL

                await self.broadcast({
                    "type": "device_status",
                    "timestamp": ts_ms,
                    "payload": {
                        "esp32Connected":      True,
                        "microphoneActive":    True,
                        "aiEngine":            "running",
                        "dspEngine":           "running",
                        "ledArrayActive":      True,
                        "serialCommunicationOk": True,
                    }
                })

                await self.broadcast({
                    "type": "system_status",
                    "timestamp": ts_ms,
                    "payload": {
                        "backendStatus": "connected",
                        "aiEngineState": "running",
                        "dspEngineState": "running",
                        "overallHealth": "healthy",
                    }
                })

            await asyncio.sleep(_FRAME_INTERVAL)

        logger.info("DSP telemetry loop stopped.")

    def start_loop(self):
        if not self._running:
            self._running = True
            self._task    = asyncio.create_task(self._dsp_telemetry_loop())

    async def stop_loop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
        _EXECUTOR.shutdown(wait=False)
        logger.info("ConnectionManager shut down.")


manager = ConnectionManager()
