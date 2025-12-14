from pydantic import BaseModel
from typing import List, Optional


class JobDescriptionRequest(BaseModel):
    text: str


class MatchRequest(BaseModel):
    resume_text: str
    job_text: str


class MatchResponse(BaseModel):
    score: float
    level: str
    matched_skills: List[str]
    missing_skills: List[str]
    summary: str


class ResumeAnalysis(BaseModel):
    skills: List[str]
    summary: str
