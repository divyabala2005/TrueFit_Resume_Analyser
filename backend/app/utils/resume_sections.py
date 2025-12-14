# app/utils/resume_sections.py

SECTION_SYNONYMS = {
    "summary": [
        "summary",
        "professional summary",
        "career objective",
        "objective",
        "professional statement",
        "about me",
        "profile"
    ],
    "skills": [
        "skills",
        "technical skills",
        "tech stack",
        "technologies",
        "tools"
    ],
    "experience": [
        "experience",
        "work experience",
        "employment",
        "work history",
        "internships",
        "professional experience"
    ],
    "education": [
        "education",
        "academic background",
        "qualification",
        "qualifications",
        "academics"
    ],
    "projects": [
        "projects",
        "academic projects",
        "personal projects",
        "major projects"
    ],
    "certifications": [
        "certifications",
        "certificates",
        "licenses"
    ]
}

def normalize_section_name(heading: str):
    heading = heading.lower().strip()

    for standard, variants in SECTION_SYNONYMS.items():
        for variant in variants:
            if variant in heading:
                return standard

    return None
