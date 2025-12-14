from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from .routers import job
from app.routers import resume
from .ai import chat

import pdfplumber
from docx import Document

from .schemas import JobDescriptionRequest, MatchRequest, MatchResponse, ResumeAnalysis
from .utils import extract_skills, compute_match
from .utils.extract import read_file_text


app = FastAPI(title="Career Compass Backend")
app.include_router(resume.router)


# --- CORS: allow your React frontend ---
origins = [
    "http://localhost:5173",  # Vite dev
    # add your deployed frontend URL later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(job.router, prefix="/api/job")
app.include_router(chat.router, prefix="/api/ai")
from .routers import activity
app.include_router(activity.router, prefix="/api/activity")


# ---------- Endpoints ----------

@app.get("/api/health")
def health_check():
    return {"status": "ok"}





@app.post("/api/job/analyze")
async def analyze_job(req: JobDescriptionRequest):
    skills = extract_skills(req.text)
    return {"skills": skills, "raw_text_length": len(req.text)}


@app.post("/api/match", response_model=MatchResponse)
async def match_resume_job(req: MatchRequest):
    score, matched, missing, summary = compute_match(req.resume_text, req.job_text)
    return MatchResponse(
        score=score,
        level="Strong Match" if score >= 8 else
              "Good Match" if score >= 6 else
              "Average Match" if score >= 4 else "Weak Match",
        matched_skills=matched,
        missing_skills=missing,
        summary=summary,
    )

@app.post("/api/match/file", response_model=MatchResponse)
async def match_resume_job_file(
    job_text: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Accepts a job description (text) + resume file (PDF/DOCX),
    extracts text from the resume and computes the match.
    """
    resume_text = read_file_text(file)
    score, matched, missing, summary = compute_match(resume_text, job_text)

    return MatchResponse(
        score=score,
        level="Strong Match" if score >= 8 else
              "Good Match" if score >= 6 else
              "Average Match" if score >= 4 else "Weak Match",
        matched_skills=matched,
        missing_skills=missing,
        summary=summary,
    )
