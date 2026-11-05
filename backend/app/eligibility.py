from .utils import split_csv


def check_eligibility(profile, job):
    """Returns {"eligible": bool, "reasons": [str]}. Deterministic, server-side."""
    reasons = []

    cgpa = profile.cgpa or 0
    if cgpa < (job.minimum_cgpa or 0):
        reasons.append(f"CGPA {cgpa} is below the required {job.minimum_cgpa}")

    backlogs = profile.backlogs or 0
    if backlogs > (job.maximum_backlogs or 0):
        reasons.append(f"Backlogs {backlogs} exceed the allowed {job.maximum_backlogs}")

    branches = [b.lower() for b in split_csv(job.eligible_branches)]
    if branches and (profile.branch or "").lower() not in branches:
        reasons.append(f"Branch '{profile.branch or 'not set'}' is not eligible")

    have = {s.lower() for s in split_csv(profile.skills)}
    missing = [s for s in split_csv(job.required_skills) if s.lower() not in have]
    if missing:
        reasons.append("Missing skills: " + ", ".join(missing))

    return {"eligible": not reasons, "reasons": reasons}