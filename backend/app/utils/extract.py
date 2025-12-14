import re
from fastapi import UploadFile, HTTPException
import pdfplumber
from docx import Document
from app.utils.resume_sections import normalize_section_name


SECTION_KEYWORDS = {
    "summary": [
        "summary", "professional summary", "career objective",
        "objective", "profile", "about me", "professional statement"
    ],
    "skills": [
        "skills", "technical skills", "key skills", "expertise"
    ],
    "experience": [
        "experience", "work experience", "employment",
        "professional experience"
    ],
    "projects": [
        "projects", "academic projects", "personal projects"
    ],
    "education": [
        "education", "qualification", "qualifications",
        "academic background"
    ],
    "certifications": [
        "certifications", "courses", "training"
    ],
    "achievements": [
        "achievements", "awards", "accomplishments"
    ]
}


def extract_skills(text: str):
    text = text.lower()

    skills = [
        "python", "java", "javascript", "react", "node", "express", "fastapi",
        "django", "flask", "html", "css", "sql", "mongodb", "docker", "aws",
        "machine learning", "deep learning", "tensorflow", "pytorch", "api"
    ]

    found = [s for s in skills if s in text]
    return found

def read_file_text(file: UploadFile) -> str:
    if file.filename.endswith(".pdf"):
        with pdfplumber.open(file.file) as pdf:
            pages_text = [p.extract_text() or "" for p in pdf.pages]
        return "\n".join(pages_text)
    elif file.filename.endswith(".docx"):
        doc = Document(file.file)
        return "\n".join([p.text for p in doc.paragraphs])
    else:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

def extract_resume_sections(resume_text: str):
    sections = {}
    current_section = None

    for line in resume_text.splitlines():
        line_clean = line.strip()

        if not line_clean:
            continue

        normalized = normalize_section_name(line_clean)

        if normalized:
            current_section = normalized
            sections[current_section] = ""
        elif current_section:
            sections[current_section] += line_clean + " "

    return sections
