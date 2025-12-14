from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..database import log_activity, get_recent_activities

router = APIRouter()

class ActivityLog(BaseModel):
    type: str # 'score', 'job', 'chat'
    tag: str
    title: str
    detail: str
    route: str

class ActivityResponse(BaseModel):
    id: int
    type: str
    tag: str | None
    title: str
    detail: str | None
    route: str | None
    timestamp: str | None

@router.get("/", response_model=List[ActivityResponse])
def get_activities():
    """Fetch recent activities (limit 10)"""
    return get_recent_activities(limit=10)

@router.post("/")
def add_activity(activity: ActivityLog):
    """Log a new activity from frontend"""
    log_activity(
        type=activity.type,
        tag=activity.tag,
        title=activity.title,
        detail=activity.detail,
        route=activity.route
    )
    return {"status": "success"}
