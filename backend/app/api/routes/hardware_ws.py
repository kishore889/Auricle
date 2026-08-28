"""
Dedicated WebSocket endpoint for the ESP32 hardware prototype (Phase B8).

The ESP32 connects here to:
1. Stream INMP441 I2S microphone audio (PCM chunks).
2. Receive 22-channel activation data for its LED strip.
"""
import asyncio
import struct
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import numpy as np

from app.core.logging import logger
from app.state import hardware_manager

router = APIRouter(tags=["Hardware"])

@router.websocket("/ws/esp32")
async def esp32_hardware_ws(websocket: WebSocket):
    await websocket.accept()
    hardware_manager.set_connected(True)
    logger.info("ESP32 hardware prototype connected.")
    
    try:
        while True:
            # The ESP32 is expected to send binary frames.
            # E.g., chunks of int16_t PCM audio data (16kHz mono).
            data = await websocket.receive_bytes()
            
            # Record heartbeat and active mic
            hardware_manager.record_heartbeat(microphone_active=True)
            
            if data:
                # Assuming 16-bit PCM integer data from INMP441, convert to float32 [-1.0, 1.0]
                try:
                    # 'h' is 2-byte short (int16)
                    num_samples = len(data) // 2
                    ints = struct.unpack(f'<{num_samples}h', data)
                    samples = np.array(ints, dtype=np.float32) / 32768.0
                    hardware_manager.audio_buffer.push(samples)
                except Exception as e:
                    logger.warning(f"Failed to unpack audio from ESP32: {e}")
                    
    except WebSocketDisconnect:
        logger.info("ESP32 hardware prototype disconnected.")
        hardware_manager.set_connected(False)
    except Exception as e:
        logger.error(f"ESP32 WS Error: {e}")
        hardware_manager.set_connected(False)
        try:
            await websocket.close()
        except:
            pass
