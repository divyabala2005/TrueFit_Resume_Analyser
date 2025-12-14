from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import json
from ..ai.chat import client # Re-using the initialized Groq client
from ..utils.extract import read_file_text

router = APIRouter()

class JobMatchRequest(BaseModel):
    job_description: str
    resume_text: str

class JobMatchResponse(BaseModel):
    match_score: int
    matched_skills: list[str]
    missing_skills: list[str]
    recommendations: list[str]

async def analyze_match_with_ai(jd_text: str, resume_text: str) -> JobMatchResponse:
    if not jd_text or not resume_text:
        raise HTTPException(status_code=400, detail="Job description and resume text are required.")

    prompt = f"""
You are an expert ATS (Applicant Tracking System) and hiring manager.

Job Description:
\"\"\"{jd_text}\"\"\"

Resume Text:
\"\"\"{resume_text}\"\"\"

Analyze the match between the resume and the job description.

1. Calculate a **Match Score** (0-100) based on skills, experience, and keywords.
2. List **Matched Skills** (skills present in both).
3. List **Missing Skills** (critical skills in JD but not in Resume).
4. Provide **Recommendations** (specific advice to improve the match).

VERY IMPORTANT:
Return your answer as valid JSON only, with this exact structure:

{{
  "match_score": 85,
  "matched_skills": ["Python", "React", "Communication"],
  "missing_skills": ["Docker", "AWS"],
  "recommendations": [
    "Add a project demonstrating Docker usage.",
    "Highlight any cloud experience, even if basic."
  ]
}}

Return ONLY JSON. No extra text.
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise ATS scanner. Always follow the requested JSON format exactly."
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        raw = completion.choices[0].message.content.strip()
        data = json.loads(raw)

        return JobMatchResponse(
            match_score=int(data.get("match_score", 0)),
            matched_skills=data.get("matched_skills", []),
            missing_skills=data.get("missing_skills", []),
            recommendations=data.get("recommendations", [])
        )

    except Exception as e:
        print("Groq job-match error:", repr(e))
        return JobMatchResponse(
            match_score=0,
            matched_skills=[],
            missing_skills=[],
            recommendations=["AI analysis failed. Please try again later."]
        )

@router.post("/match", response_model=JobMatchResponse)
async def match_job(data: JobMatchRequest):
    return await analyze_match_with_ai(data.job_description.strip(), data.resume_text.strip())

@router.post("/match-file", response_model=JobMatchResponse)
async def match_job_file(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...)
):
    resume_text = read_file_text(resume_file)
    return await analyze_match_with_ai(job_description.strip(), resume_text.strip())

# Gap analysis is now effectively covered by the detailed match response, 
# but keeping a stub or redirecting if frontend specifically calls it.
# For now, we will leave it or remove it if unused. 
# The plan focused on /match.
