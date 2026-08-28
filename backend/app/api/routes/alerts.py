"""
Alerts management routes — upgraded in Phase B6 to serve live alert data.
"""
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, HTTPException, status

from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.alerts import Alert, AlertStatus, AlertSeverity, AlertType, AlertUpdateRequest
from app.schemas.common import PaginatedResponse
from app.state import safety_manager

router = APIRouter(prefix="/alerts", tags=["Alerts Management"])


def _alert_record_to_schema(a) -> Alert:
    return Alert(
        id=a.id,
        timestamp=a.timestamp,
        severity=a.severity,
        type=a.alert_type,
        status=a.status,
        message=a.message,
        source=a.source,
        acknowledgedAt=a.acknowledgedAt,
        resolvedAt=a.resolvedAt,
        metadata=None,
    )


@router.get("", response_model=PaginatedResponse[Alert])
async def get_alerts(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    status: Optional[AlertStatus] = None,
    severity: Optional[AlertSeverity] = None,
    type: Optional[AlertType] = None,
    user: User = Depends(get_current_user),
) -> PaginatedResponse[Alert]:
    records, total = safety_manager.get_alerts(
        page=page,
        page_size=pageSize,
        status_filter=status,
        severity_filter=severity,
        type_filter=type,
    )
    return PaginatedResponse(
        items=[_alert_record_to_schema(r) for r in records],
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=max(1, math.ceil(total / pageSize)),
    )


@router.patch("/{alert_id}", response_model=Alert)
async def update_alert(
    update: AlertUpdateRequest,
    alert_id: str = Path(...),
    user: User = Depends(get_current_user),
) -> Alert:
    if update.status == "acknowledged":
        record = safety_manager.acknowledge(alert_id)
    else:
        record = safety_manager.resolve(alert_id)

    if record is None:
        # If unknown ID fall back to a generic 404-style response using the
        # requested ID so the frontend still gets a valid Alert schema
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "RESOURCE_NOT_FOUND", "message": f"Alert {alert_id} not found."}},
        )

    return _alert_record_to_schema(record)
