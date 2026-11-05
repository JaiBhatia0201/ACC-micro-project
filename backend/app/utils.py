def split_csv(s):
    return [x.strip() for x in (s or "").split(",") if x.strip()]


def join_csv(items):
    return ",".join(x.strip() for x in items if x and x.strip())


def profile_to_dict(user, p):
    return {
        "name": user.name,
        "email": user.email,
        "branch": p.branch,
        "semester": p.semester,
        "cgpa": p.cgpa,
        "backlogs": p.backlogs,
        "skills": split_csv(p.skills),
        "phone": p.phone,
        "has_resume": bool(p.resume_reference),
        "resume_name": p.resume_reference.split("/")[-1] if p.resume_reference else None,
    }


def job_to_dict(j):
    return {
        "id": j.id,
        "company_id": j.company_id,
        "company_name": j.company.name if j.company else None,
        "title": j.title,
        "description": j.description,
        "minimum_cgpa": j.minimum_cgpa,
        "maximum_backlogs": j.maximum_backlogs,
        "eligible_branches": split_csv(j.eligible_branches),
        "required_skills": split_csv(j.required_skills),
        "deadline": j.deadline.isoformat() if j.deadline else None,
        "status": j.status,
    }


def company_to_dict(c):
    return {"id": c.id, "name": c.name, "description": c.description,
            "website": c.website, "industry": c.industry}