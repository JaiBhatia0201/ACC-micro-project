from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Company
from ..security import get_current_user, require_admin
from ..utils import company_to_dict

router = APIRouter(prefix="/api/companies", tags=["companies"])


class CompanyIn(BaseModel):
    name: str
    description: str = ""
    website: str = ""
    industry: str = ""


@router.get("")
def list_companies(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return [company_to_dict(c) for c in db.query(Company).order_by(Company.id).all()]


@router.post("")
def create_company(body: CompanyIn, user=Depends(require_admin), db: Session = Depends(get_db)):
    c = Company(**body.model_dump())
    db.add(c)
    db.commit()
    return company_to_dict(c)


@router.put("/{company_id}")
def update_company(company_id: int, body: CompanyIn, user=Depends(require_admin),
                   db: Session = Depends(get_db)):
    c = db.get(Company, company_id)
    if not c:
        raise HTTPException(404, "Company not found")
    for k, v in body.model_dump().items():
        setattr(c, k, v)
    db.commit()
    return company_to_dict(c)


@router.delete("/{company_id}")
def delete_company(company_id: int, user=Depends(require_admin), db: Session = Depends(get_db)):
    c = db.get(Company, company_id)
    if not c:
        raise HTTPException(404, "Company not found")
    db.delete(c)   # cascades to its jobs and their applications
    db.commit()
    return {"deleted": company_id}