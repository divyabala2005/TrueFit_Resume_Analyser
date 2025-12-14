def compute_match(jd_skills, resume_skills):
    matched = [s for s in jd_skills if s.lower() in resume_skills]
    missing = [s for s in jd_skills if s.lower() not in resume_skills]

    score = round((len(matched) / len(jd_skills)) * 10, 1) if jd_skills else 0

    return score, matched, missing