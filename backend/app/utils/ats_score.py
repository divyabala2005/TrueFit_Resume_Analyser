import re

def word_count(text):
    return len(text.split())

def has_numbers(text):
    return bool(re.search(r"\d", text))

def calculate_section_score(section, content):
    score = 0
    issues = []
    improvements = []

    wc = word_count(content)

    if section == "summary":
        if wc >= 40:
            score += 60
        else:
            issues.append("Summary is too short.")
            improvements.append("Increase summary length to 3–4 strong lines.")

        if has_numbers(content):
            score += 20
        else:
            issues.append("Lack of quantifiable results.")
            improvements.append("Add measurable impact (years, %, results).")

        score += 20  # basic presence bonus

    elif section == "skills":
        skill_count = len(content.split(","))
        if skill_count >= 8:
            score += 70
        else:
            issues.append("Too few skills listed.")
            improvements.append("Add more relevant technical skills.")

        score += 30

    elif section == "experience":
        if wc >= 80:
            score += 60
        else:
            issues.append("Experience descriptions are brief.")
            improvements.append("Explain responsibilities in more detail.")

        if has_numbers(content):
            score += 30
        else:
            issues.append("Achievements are not quantified.")
            improvements.append("Quantify achievements with numbers.")

        score += 10

    elif section == "education":
        score += 80
        if wc < 20:
            issues.append("Education details may be incomplete.")
            improvements.append("Add degree, institution, and year clearly.")
        score += 20

    elif section == "projects":
        if wc >= 60:
            score += 70
        else:
            issues.append("Project descriptions lack depth.")
            improvements.append("Describe project impact and technologies used.")

        score += 30

    else:
        score = 60
        issues.append("Section content is generic.")
        improvements.append("Expand this section with clearer details.")

    return min(score, 100), issues, improvements

def calculate_ats_score(sections: dict):
    section_scores = {}
    strengths = []
    gaps = {}   # improvements
    issues_map = {} # issues

    total = 0
    count = 0

    for section, content in sections.items():
        score, issues, improvements = calculate_section_score(section, content)
        section_scores[section] = score
        total += score
        count += 1

        if score >= 75:
            strengths.append(section.capitalize())
        if improvements:
            gaps[section] = improvements
        if issues:
            issues_map[section] = issues

    overall = round(total / count) if count else 0

    return {
        "overall_score": overall,
        "section_scores": section_scores,
        "strengths": strengths,
        "gaps": gaps,
        "issues": issues_map
    }
