"""
WebSocket endpoint router.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.core.security import decode_access_token
from app.repositories.user_repo import UserRepository
from app.services.websocket import manager
from app.core.logging import logger

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str | None = Query(None)
):
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing token")
        return

    # Validate JWT
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Missing subject claim.")
    except Exception as e:
        logger.warning(f"WebSocket auth failed (token decode): {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
        return

    # Validate User against DB
    try:
        async with AsyncSessionLocal() as db:
            repo = UserRepository(db)
            user = await repo.get_by_id(user_id)
            if not user or not user.is_active:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User inactive or missing")
                return
    except Exception as e:
        logger.error(f"WebSocket auth failed (DB check): {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason="Internal error during auth")
        return

    # Accept connection
    await manager.connect(websocket)

    try:
        while True:
            # The client doesn't send much in this phase, but we need to receive to keep connection alive
            # and detect client disconnects.
            data = await websocket.receive_text()
            # We don't process incoming WS commands right now
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
