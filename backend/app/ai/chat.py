from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(tags=["AI Chat"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("⚠ GROQ_API_KEY missing in .env")
client = Groq(api_key=GROQ_API_KEY)


class ChatRequest(BaseModel):
    message: str
    resume_text: str | None = None

class ScoreInsightsRequest(BaseModel):
    resume_text: str


class ScoreInsightsResponse(BaseModel):
    ats_score: int
    strengths: list[str]
    drawbacks: list[str]
    improvements: list[str]


from ..database import save_message, get_history, clear_history

@router.get("/history")
def get_chat_history():
    return get_history()

@router.delete("/history")
def clear_chat_history():
    clear_history()
    return {"status": "cleared"}

@router.post("/chat")
async def ai_chat(payload: ChatRequest):
    """
    Fully conversational AI chat using Groq (Llama 3.3 70B).
    If Groq fails, returns a friendly fallback message instead of 500.
    """
    user_msg = payload.message.strip()
    resume_ctx = (payload.resume_text or "").strip()

    if not user_msg:
        raise HTTPException(status_code=400, detail="Message is required")

    # Save user message
    save_message("user", user_msg)

    # Build the actual text we send to the model
    if resume_ctx:
        user_content = (
            f"{user_msg}\n\n"
            f"---\nRESUME CONTEXT (Use ONLY if the user asks about their resume/profile):\n{resume_ctx}\n"
            "If the question is general (e.g., 'trending skills', 'roadmap'), ANSWER GENERALLY. Do NOT force the resume context unless relevant."
        )
    else:
        user_content = user_msg

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are TrueFit AI — a friendly, human-like career assistant. "
                        "You talk naturally, like ChatGPT. "
                        "GUIDELINES:\n"
                        "1. If the user asks about THEIR resume/skills (e.g. 'rate me', 'projects', 'what to improve'), use the provided RESUME CONTEXT.\n"
                        "2. If the user asks GENERAL questions (e.g. 'future of AI', 'react vs vue', 'how to become X'), answer generally based on your knowledge. DO NOT mention their resume unless they ask to compare.\n"
                        "3. Keep answers concise and helpful."
                    ),
                },
                {
                    "role": "user",
                    "content": user_content,
                },
            ],
            temperature=0.6,
        )

        reply_text = completion.choices[0].message.content
        
        # Save AI reply
        save_message("ai", reply_text)
        
        return {"reply": reply_text}

    except Exception as e:
        # Log real error in backend, but DON'T crash the API
        print("Groq AI error:", repr(e))

        fallback = (
            "Right now the external AI engine is not responding properly (API error). "
            "Please check that your GROQ_API_KEY is valid and that your account has access "
            "to model `llama-3.3-70b-versatile`.\n\n"
            "For now, here’s a generic suggestion:\n"
            "- Focus on 1 role (e.g., frontend, backend, data).\n"
            "- List your current skills and compare with job descriptions.\n"
            "- Start building 2–3 projects that match the role requirements.\n"
        )
        
        # Save fallback reply
        save_message("ai", fallback)
        
        # Still HTTP 200, so frontend never breaks
        return {"reply": fallback}
    
@router.post("/score-insights", response_model=ScoreInsightsResponse)
async def score_insights(payload: ScoreInsightsRequest):
    """
    Analyze resume and return:
    - ats_score (0–100)
    - strengths (list)
    - drawbacks (list of gaps/weaknesses)
    - improvements (list of actionable steps)
    """
    resume_text = payload.resume_text.strip()
    if not resume_text:
        raise HTTPException(status_code=400, detail="resume_text is required")

    prompt = f"""
You are an expert ATS (Applicant Tracking System) scanner and career coach.

Analyze the following resume text:

\"\"\"{resume_text}\"\"\"

1. Calculate a strict ATS Score out of 100 based on formatting, keyword usage, clarity, and impact.
2. Identifiy key Strengths (what makes this resume stand out).
3. Identify Drawbacks (what is missing, weak, or confusing).
4. Suggest specific Improvements (how to fix the drawbacks and increase the score).

VERY IMPORTANT:
Return your answer as valid JSON only, with this exact structure:

{{
  "ats_score": 75,
  "strengths": [
    "Strong action verbs used throughout experience section.",
    "Clear distinction between technical and soft skills."
  ],
  "drawbacks": [
    "Summary is too vague and lacks specific career goals.",
    "Education section formatting is inconsistent."
  ],
  "improvements": [
    "Rewrite the professional summary to mention specific roles you are targeting.",
    "Standardize date formats in the education section (e.g., Month Year)."
  ]
}}

Return ONLY JSON. No extra text, no explanations.
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
            temperature=0.4,
        )

        raw = completion.choices[0].message.content.strip()
        data = json.loads(raw)

        # Basic safety defaults if something is missing
        return ScoreInsightsResponse(
            ats_score=int(data.get("ats_score", 50)),
            strengths=data.get("strengths", []),
            drawbacks=data.get("drawbacks", []),
            improvements=data.get("improvements", []),
        )

    except Exception as e:
        print("Groq score-insights error:", repr(e))
        # Fallback generic response
        return ScoreInsightsResponse(
            ats_score=50,
            strengths=[
                "Basic resume structure detected.",
            ],
            drawbacks=[
                "Could not perform deep AI analysis due to a service error.",
            ],
            improvements=[
                "Please check your internet connection or try again later.",
            ],
        )

