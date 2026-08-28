"""
Safety event lifecycle manager for Phase B6.

Manages in-memory safety event state:
  - Raises new SafetyEvent objects when a hazardous classification is detected.
  - Debounces repeated detections of the same category.
  - Auto-clears events after AUTO_CLEAR_SECONDS of continuous non-detection.
  - Exposes acknowledge() / resolve() for REST API use.
  - Provides paginated history and active-event queries.
"""
from __future__ import annotations

import time
import uuid
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Lock
from typing import Deque, Dict, List, Literal, Optional

from app.services.ai.sound_classifier import ClassificationResult, SoundCategory

# ── Configuration ──────────────────────────────────────────────────────────────
AUTO_CLEAR_SECONDS  = 10      # seconds of silence before an active event self-clears
MAX_HISTORY         = 200     # cap in-memory history to avoid unbounded growth

AlertSeverity = Literal["info", "warning", "error", "critical"]
EventState    = Literal["active", "cleared", "acknowledged"]


# ── Domain objects ─────────────────────────────────────────────────────────────

@dataclass
class SafetyEvent:
    id:           str
    timestamp:    str          # ISO-8601 UTC
    category:     SoundCategory
    confidence:   float
    severity:     AlertSeverity
    priority:     str
    state:        EventState
    description:  str
    autoCleared:  bool
    clearedAt:    Optional[str]
    _last_seen:   float = field(default_factory=time.monotonic, repr=False)

    def as_dict(self) -> dict:
        return {
            "id":          self.id,
            "timestamp":   self.timestamp,
            "category":    self.category,
            "confidence":  self.confidence,
            "severity":    self.severity,
            "priority":    self.priority,
            "state":       self.state,
            "description": self.description,
            "autoCleared": self.autoCleared,
            "clearedAt":   self.clearedAt,
        }


# Derived alert representation (matches AlertResponse schema)
@dataclass
class AlertRecord:
    id:             str
    timestamp:      str
    severity:       AlertSeverity
    alert_type:     str
    status:         Literal["active", "acknowledged", "resolved"]
    message:        str
    source:         str
    acknowledgedAt: Optional[str]
    resolvedAt:     Optional[str]

    def as_dict(self) -> dict:
        return {
            "id":             self.id,
            "timestamp":      self.timestamp,
            "severity":       self.severity,
            "type":           self.alert_type,
            "status":         self.status,
            "message":        self.message,
            "source":         self.source,
            "acknowledgedAt": self.acknowledgedAt,
            "resolvedAt":     self.resolvedAt,
            "metadata":       None,
        }


# ── Severity / priority mapping ────────────────────────────────────────────────

_CATEGORY_META: Dict[str, tuple[AlertSeverity, str, str]] = {
    # category  -> (severity, priority, description template)
    "hazard":  ("critical", "critical", "Hazardous sound detected: {category}. Immediate attention required."),
    "warning": ("warning",  "high",     "Warning-level sound detected: {category}."),
    "speech":  ("info",     "medium",   "Speech activity detected."),
    "environmental": ("info", "low",    "Environmental sound detected: {category}."),
    "system":  ("info",     "low",      "System notification."),
}


def _severity_for(category: str) -> tuple[AlertSeverity, str, str]:
    return _CATEGORY_META.get(category, ("info", "low", "Unknown event: {category}."))


def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")


# ── Manager ────────────────────────────────────────────────────────────────────

class SafetyEventManager:
    """
    Thread-safe, in-memory safety event manager.
    Designed to be used as a module-level singleton (see app/state.py).
    """

    def __init__(self):
        self._lock:          Lock                        = Lock()
        # active_events keyed by category string
        self._active:        Dict[str, SafetyEvent]     = {}
        # full history ring-buffer
        self._history:       Deque[SafetyEvent]         = deque(maxlen=MAX_HISTORY)
        # alert records keyed by alert id
        self._alerts:        Dict[str, AlertRecord]     = {}
        # events that fired since last check (for WS broadcasting)
        self._new_events:    List[SafetyEvent]          = []
        self._cleared_events: List[SafetyEvent]         = []

    # ── Core processing ────────────────────────────────────────────────────────

    def _map_category_to_alert_type(self, category: str) -> str:
        if category == "hazard":
            return "alarm"
        elif category == "warning":
            return "high_priority_environmental"
        return "system_info"

    def process(self, result: ClassificationResult) -> Optional[SafetyEvent]:
        """
        Called every second from the DSP telemetry loop.
        Returns a newly created SafetyEvent if one was just triggered, else None.
        """
        with self._lock:
            now_monotonic = time.monotonic()
            triggered: Optional[SafetyEvent] = None

            if result.isSafetyEvent:
                existing = self._active.get(result.category)
                if existing is None:
                    # New safety event — raise it
                    sev, pri, desc_tmpl = _severity_for(result.category)
                    event = SafetyEvent(
                        id          = f"safe-{uuid.uuid4().hex[:8]}",
                        timestamp   = _utcnow(),
                        category    = result.category,  # type: ignore[arg-type]
                        confidence  = round(result.confidence, 3),
                        severity    = sev,
                        priority    = pri,
                        state       = "active",
                        description = desc_tmpl.format(category=result.category),
                        autoCleared = False,
                        clearedAt   = None,
                        _last_seen  = now_monotonic,
                    )
                    self._active[result.category] = event
                    self._history.appendleft(event)
                    self._new_events.append(event)
                    # Create matching alert record
                    alert = AlertRecord(
                        id             = f"alt-{uuid.uuid4().hex[:8]}",
                        timestamp      = event.timestamp,
                        severity       = sev,
                        alert_type     = self._map_category_to_alert_type(result.category),
                        status         = "active",
                        message        = event.description,
                        source         = "ai_engine",
                        acknowledgedAt = None,
                        resolvedAt     = None,
                    )
                    self._alerts[alert.id] = alert
                    triggered = event
                else:
                    # Update last seen timestamp for debounce / auto-clear
                    existing._last_seen = now_monotonic

            # Auto-clear stale active events
            cleared = []
            for cat, event in list(self._active.items()):
                if now_monotonic - event._last_seen > AUTO_CLEAR_SECONDS:
                    event.state      = "cleared"
                    event.autoCleared = True
                    event.clearedAt  = _utcnow()
                    cleared.append(event)
                    # Mark matching alert as resolved
                    for alert in self._alerts.values():
                        if alert.alert_type == self._map_category_to_alert_type(cat) and alert.status == "active":
                            alert.status     = "resolved"
                            alert.resolvedAt = event.clearedAt

            for event in cleared:
                del self._active[event.category]  # type: ignore[arg-type]
                self._cleared_events.append(event)

            return triggered

    def pop_new_events(self) -> tuple[List[SafetyEvent], List[SafetyEvent]]:
        """Return and reset pending new / cleared event lists for WS broadcasting."""
        with self._lock:
            new     = self._new_events[:]
            cleared = self._cleared_events[:]
            self._new_events.clear()
            self._cleared_events.clear()
        return new, cleared

    # ── REST API hooks ────────────────────────────────────────────────────────

    def acknowledge(self, alert_id: str) -> Optional[AlertRecord]:
        with self._lock:
            alert = self._alerts.get(alert_id)
            if alert and alert.status == "active":
                alert.status         = "acknowledged"
                alert.acknowledgedAt = _utcnow()
                # Also mark related safety event
                for event in self._active.values():
                    if self._map_category_to_alert_type(event.category) == alert.alert_type:
                        event.state = "acknowledged"
            return alert

    def resolve(self, alert_id: str) -> Optional[AlertRecord]:
        with self._lock:
            alert = self._alerts.get(alert_id)
            if alert and alert.status in ("active", "acknowledged"):
                alert.status     = "resolved"
                alert.resolvedAt = _utcnow()
                # Resolve related safety event
                for cat, event in list(self._active.items()):
                    if self._map_category_to_alert_type(cat) == alert.alert_type:
                        ev = self._active.pop(cat)
                        ev.state     = "cleared"
                        ev.clearedAt = alert.resolvedAt
                        break
            return alert

    def get_alert(self, alert_id: str) -> Optional[AlertRecord]:
        with self._lock:
            return self._alerts.get(alert_id)

    def get_alerts(
        self,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
        severity_filter: Optional[str] = None,
        type_filter: Optional[str] = None,
    ) -> tuple[List[AlertRecord], int]:
        with self._lock:
            alerts = list(self._alerts.values())

        # Most recent first
        alerts.sort(key=lambda a: a.timestamp, reverse=True)

        if status_filter:
            alerts = [a for a in alerts if a.status == status_filter]
        if severity_filter:
            alerts = [a for a in alerts if a.severity == severity_filter]
        if type_filter:
            alerts = [a for a in alerts if a.alert_type == type_filter]

        total  = len(alerts)
        start  = (page - 1) * page_size
        return alerts[start : start + page_size], total

    def get_history(
        self,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[SafetyEvent], int]:
        with self._lock:
            items = list(self._history)
        total = len(items)
        start = (page - 1) * page_size
        return items[start : start + page_size], total

    def get_latest_detection(self) -> Optional[SafetyEvent]:
        with self._lock:
            return next(iter(self._history), None)
