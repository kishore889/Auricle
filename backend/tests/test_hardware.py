"""
Tests for Phase B8 — Hardware Interface
"""
import numpy as np

from app.services.hardware.manager import HardwareManager

def test_audio_ring_buffer():
    manager = HardwareManager()
    buf = manager.audio_buffer
    
    # Initially empty
    assert len(buf) == 0
    assert buf.pop(100) is None
    
    # Push samples
    samples = np.ones(500, dtype=np.float32)
    buf.push(samples)
    assert len(buf) == 500
    
    # Pop samples
    popped = buf.pop(400)
    assert len(popped) == 400
    assert len(buf) == 100
    assert popped[0] == 1.0
    
    # Not enough to pop 200
    assert buf.pop(200) is None
    
    # Clear
    buf.clear()
    assert len(buf) == 0


def test_hardware_manager_status():
    manager = HardwareManager()
    
    # Default disconnected
    status = manager.get_status()
    assert status.esp32Connected is False
    assert status.overallHealth == "offline"
    
    # Connect
    manager.set_connected(True)
    status = manager.get_status()
    assert status.esp32Connected is True
    assert status.overallHealth == "healthy"
    
    # Heartbeat updates mic state
    manager.record_heartbeat(microphone_active=True)
    status = manager.get_status()
    assert status.microphoneActive is True
    assert status.microphoneInputState == "sampling"
    
    # Disconnect clears mic
    manager.set_connected(False)
    status = manager.get_status()
    assert status.esp32Connected is False
    assert status.microphoneActive is False
    assert status.microphoneInputState == "disconnected"


def test_hardware_manager_info():
    manager = HardwareManager()
    info = manager.get_info()
    assert info.id == "ESP32-AURICLE-LIVE"
