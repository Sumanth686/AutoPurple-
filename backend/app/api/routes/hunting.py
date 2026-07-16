from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from app.api.routes.cases import cases_db

router = APIRouter(prefix="/api/hunting", tags=["hunting"])
hunts_db = []

class HuntCreate(BaseModel):
    title: str
    hypothesis: str
    technique_id: str

@router.get("/")
def get_hunts():
    return {"hunts": hunts_db}

@router.post("/")
def create_hunt(hunt: HuntCreate):
    new_hunt = {
        "id": len(hunts_db) + 1,
        "title": hunt.title,
        "hypothesis": hunt.hypothesis,
        "technique_id": hunt.technique_id,
        "status": "open",
        "findings": [],
        "created_at": datetime.utcnow().isoformat()
    }
    hunts_db.append(new_hunt)
    return new_hunt

@router.post("/{hunt_id}/findings")
def add_finding(hunt_id: int, finding: dict):
    hunt = next((h for h in hunts_db if h["id"] == hunt_id), None)
    if hunt:
        hunt["findings"].append(finding)
        hunt["status"] = "findings_identified"
    return hunt

@router.post("/{hunt_id}/escalate")
def escalate_hunt_to_case(hunt_id: int):
    hunt = next((h for h in hunts_db if h["id"] == hunt_id), None)
    if not hunt:
        return {"error": "Hunt not found"}
    new_case = {
        "id": len(cases_db) + 1,
        "title": f"Escalated Hunt: {hunt['title']}",
        "description": hunt["hypothesis"],
        "related_technique_id": hunt["technique_id"],
        "priority": "high",
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }
    cases_db.append(new_case)
    hunt["status"] = "escalated"
    return new_case
