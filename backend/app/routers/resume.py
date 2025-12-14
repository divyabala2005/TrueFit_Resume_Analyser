from fastapi import APIRouter, UploadFile, File
from app.utils.utils import extract_text_from_file
from app.utils.extract import extract_resume_sections
from app.utils.ats_score import calculate_ats_score


router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    # 1️⃣ Extract text
    resume_text = await extract_text_from_file(file)

    if not resume_text:
        return {"error": "Could not extract text from resume"}

    # 2️⃣ Extract resume sections
    sections = extract_resume_sections(resume_text)

    # 3️⃣ Calculate ATS score (section-wise)
    ats_result = calculate_ats_score(sections)

    # 4️⃣ Extract raw content for sidebar context
    from app.utils.extract import extract_skills
    raw_skills = extract_skills(resume_text)
    raw_summary = sections.get("summary", "") or sections.get("profile", "") or "No summary detected."
    raw_projects = sections.get("projects", "") or "No projects detected."

    # 5️⃣ Format response for frontend
    formatted_sections = {}
    for section_name, content in sections.items():
        score = ats_result["section_scores"].get(section_name, 0)
        improvements = ats_result["gaps"].get(section_name, [])
        issues = ats_result["issues"].get(section_name, [])
        
        # Fallback if low score but no specific issues returned
        if score < 70 and not issues and not improvements:
             issues.append(f"Content in {section_name} needs more detail.")

        formatted_sections[section_name] = {
            "score": score,
            "issues": issues, 
            "improvements": improvements
        }

    return {
        "overall_score": ats_result["overall_score"],
        "sections": formatted_sections,
        "extracted_data": {
            "skills": raw_skills,
            "summary": raw_summary.strip(),
            "projects": raw_projects.strip()
        }
    }

