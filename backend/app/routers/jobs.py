from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..eligibility import check_eligibility
from ..models import Job, Company, Application
from ..security import get_current_user, require_admin, require_student
from ..utils import job_to_dict, join_csv, split_csv

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class JobIn(BaseModel):
    company_id: int
    title: str
    description: str = ""
    minimum_cgpa: float = Field(default=0, ge=0, le=10)
    maximum_backlogs: int = Field(default=0, ge=0)
    eligible_branches: list[str] = []
    required_skills: list[str] = []
    deadline: Optional[date] = None
    status: str = "OPEN"


def _apply_fields(job: Job, body: JobIn):
    job.company_id = body.company_id
    job.title = body.title
    job.description = body.description
    job.minimum_cgpa = body.minimum_cgpa
    job.maximum_backlogs = body.maximum_backlogs
    job.eligible_branches = join_csv(body.eligible_branches)
    job.required_skills = join_csv(body.required_skills)
    job.deadline = body.deadline
    job.status = body.status


@router.get("")
def list_jobs(user=Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Job)
    is_student = user.role == "STUDENT"
    if is_student:
        q = q.filter(Job.status == "OPEN")
    profile = user.profile if is_student else None
    applied = {a.job_id: a.status for a in profile.applications} if profile else {}

    result = []
    for j in q.order_by(Job.id.desc()).all():
        d = job_to_dict(j)
        if profile:
            d["eligibility"] = check_eligibility(profile, j)
            d["application_status"] = applied.get(j.id)
        else:
            d["applicants"] = len(j.applications)
        result.append(d)
    return result


@router.get("/{job_id}")
def get_job(job_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    j = db.get(Job, job_id)
    if not j:
        raise HTTPException(404, "Job not found")
    d = job_to_dict(j)
    if user.role == "STUDENT":
        d["eligibility"] = check_eligibility(user.profile, j)
    return d


@router.post("")
def create_job(body: JobIn, user=Depends(require_admin), db: Session = Depends(get_db)):
    if not db.get(Company, body.company_id):
        raise HTTPException(400, "Company does not exist")
    j = Job()
    _apply_fields(j, body)
    db.add(j)
    db.commit()
    return job_to_dict(j)


@router.put("/{job_id}")
def update_job(job_id: int, body: JobIn, user=Depends(require_admin), db: Session = Depends(get_db)):
    j = db.get(Job, job_id)
    if not j:
        raise HTTPException(404, "Job not found")
    _apply_fields(j, body)
    db.commit()
    return job_to_dict(j)


@router.delete("/{job_id}")
def delete_job(job_id: int, user=Depends(require_admin), db: Session = Depends(get_db)):
    j = db.get(Job, job_id)
    if not j:
        raise HTTPException(404, "Job not found")
    db.delete(j)
    db.commit()
    return {"deleted": job_id}


@router.post("/{job_id}/apply")
def apply(job_id: int, user=Depends(require_student), db: Session = Depends(get_db)):
    j = db.get(Job, job_id)
    if not j:
        raise HTTPException(404, "Job not found")
    if j.status != "OPEN":
        raise HTTPException(400, "This job is closed")
    if j.deadline and j.deadline < date.today():
        raise HTTPException(400, "The application deadline has passed")

    profile = user.profile
    result = check_eligibility(profile, j)   # enforced server-side
    if not result["eligible"]:
        raise HTTPException(400, "Not eligible: " + "; ".join(result["reasons"]))

    exists = db.query(Application).filter_by(student_id=profile.id, job_id=j.id).first()
    if exists:
        raise HTTPException(409, "You have already applied to this job")

    a = Application(student_id=profile.id, job_id=j.id, status="APPLIED")
    db.add(a)
    db.commit()
    return {"id": a.id, "status": a.status}


@router.get("/{job_id}/applications")
def job_applicants(job_id: int, user=Depends(require_admin), db: Session = Depends(get_db)):
    j = db.get(Job, job_id)
    if not j:
        raise HTTPException(404, "Job not found")
    out = []
    for a in j.applications:
        p = a.student
        out.append({
            "id": a.id,
            "status": a.status,
            "application_date": a.application_date.isoformat(),
            "student": {
                "name": p.user.name, "email": p.user.email, "branch": p.branch,
                "semester": p.semester, "cgpa": p.cgpa, "backlogs": p.backlogs,
                "skills": split_csv(p.skills), "has_resume": bool(p.resume_reference),
            },
            "eligibility": check_eligibility(p, j),
        })
    return out