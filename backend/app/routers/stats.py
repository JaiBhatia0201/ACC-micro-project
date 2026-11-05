from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import StudentProfile, Job, Application
from ..security import require_admin

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
def stats(user=Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "total_students": db.query(StudentProfile).count(),
        "active_jobs": db.query(Job).filter(Job.status == "OPEN").count(),
        "total_applications": db.query(Application).count(),
        "shortlisted": db.query(Application).filter(Application.status == "SHORTLISTED").count(),
        "placed": db.query(Application).filter(Application.status == "OFFERED").count(),
    }