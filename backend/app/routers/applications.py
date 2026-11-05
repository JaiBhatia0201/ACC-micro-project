from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application
from ..security import require_admin, require_student
from .. import storage

router = APIRouter(prefix="/api/applications", tags=["applications"])

VALID_STATUSES = {"APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED"}


class StatusIn(BaseModel):
    status: str


@router.get("")
def my_applications(user=Depends(require_student)):
    apps = sorted(user.profile.applications, key=lambda a: a.id, reverse=True)
    return [{
        "id": a.id,
        "status": a.status,
        "application_date": a.application_date.isoformat(),
        "job_id": a.job_id,
        "job_title": a.job.title,
        "company_name": a.job.company.name,
    } for a in apps]


@router.put("/{app_id}/status")
def update_status(app_id: int, body: StatusIn, user=Depends(require_admin),
                  db: Session = Depends(get_db)):
    status = body.status.upper()
    if status not in VALID_STATUSES:
        raise HTTPException(400, f"Status must be one of {sorted(VALID_STATUSES)}")
    a = db.get(Application, app_id)
    if not a:
        raise HTTPException(404, "Application not found")
    a.status = status
    db.commit()
    return {"id": a.id, "status": a.status}


@router.get("/{app_id}/resume")
def applicant_resume(app_id: int, user=Depends(require_admin), db: Session = Depends(get_db)):
    a = db.get(Application, app_id)
    if not a or not a.student.resume_reference:
        raise HTTPException(404, "No resume available")
    return Response(storage.download_resume(a.student.resume_reference),
                    media_type="application/pdf")