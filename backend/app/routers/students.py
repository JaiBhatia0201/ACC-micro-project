import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import require_student
from ..utils import profile_to_dict, join_csv
from .. import storage

router = APIRouter(prefix="/api/students", tags=["students"])


class ProfileIn(BaseModel):
    name: str
    branch: str
    semester: int = Field(ge=1, le=8)
    cgpa: float = Field(ge=0, le=10)
    backlogs: int = Field(ge=0)
    skills: list[str] = []
    phone: str = ""


@router.get("/profile")
def get_profile(user=Depends(require_student)):
    return profile_to_dict(user, user.profile)


@router.put("/profile")
def update_profile(body: ProfileIn, user=Depends(require_student), db: Session = Depends(get_db)):
    p = user.profile
    user.name = body.name.strip()
    p.branch = body.branch.strip()
    p.semester = body.semester
    p.cgpa = body.cgpa
    p.backlogs = body.backlogs
    p.skills = join_csv(body.skills)
    p.phone = body.phone
    db.commit()
    return profile_to_dict(user, p)


@router.post("/resume")
async def upload_resume(file: UploadFile = File(...), user=Depends(require_student),
                        db: Session = Depends(get_db)):
    name = os.path.basename(file.filename or "resume.pdf")
    if not name.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are allowed")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 5 MB)")
    key = f"student-{user.profile.id}/{name}"
    try:
        storage.upload_resume(key, data, "application/pdf")
    except Exception as e:
        raise HTTPException(503, f"Storage unavailable: {e}")
    user.profile.resume_reference = key
    db.commit()
    return profile_to_dict(user, user.profile)


@router.get("/resume")
def download_own_resume(user=Depends(require_student)):
    key = user.profile.resume_reference
    if not key:
        raise HTTPException(404, "No resume uploaded")
    return Response(storage.download_resume(key), media_type="application/pdf")