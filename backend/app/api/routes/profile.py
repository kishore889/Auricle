"""
Profile routes.
"""
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.auth import UserOut
from app.api.routes.auth import _make_user_out

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=UserOut)
async def get_profile(user: User = Depends(get_current_user)) -> UserOut:
    return _make_user_out(user)

@router.put("", response_model=UserOut)
async def update_profile(user: User = Depends(get_current_user)) -> UserOut:
    # In a real implementation, we would take a request body and update the user model
    return _make_user_out(user)
