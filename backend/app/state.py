"""
Application-level shared singletons.

Import from here rather than directly from service modules so that
both the WebSocket telemetry loop and the REST route handlers always
operate on the same in-memory state object.
"""
from app.services.safety.event_manager import SafetyEventManager
from app.services.dsp.profile_manager import ChannelProfileManager
from app.services.hardware.manager import HardwareManager

# Module-level singletons — created once at import time
safety_manager: SafetyEventManager = SafetyEventManager()
profile_manager: ChannelProfileManager = ChannelProfileManager()
hardware_manager: HardwareManager = HardwareManager()
