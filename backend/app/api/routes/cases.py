from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/cases", tags=["cases"])
cases_db = []

class CaseCreate(BaseModel):
    title: str
    description: str
    related_technique_id: str
    priority: str

@router.get("/")
def get_cases():
    return {"cases": cases_db}

@router.post("/")
def create_case(case: CaseCreate):
    new_case = {
        "id": len(cases_db) + 1,
        "title": case.title,
        "description": case.description,
        "related_technique_id": case.related_technique_id,
        "priority": case.priority,
        "status": "open",
        "source": "manual",
        "created_at": datetime.utcnow().isoformat()
    }
    cases_db.append(new_case)
    return new_case

@router.patch("/{case_id}/close")
def close_case(case_id: int):
    case = next((c for c in cases_db if c["id"] == case_id), None)
    if case:
        case["status"] = "closed"
    return case