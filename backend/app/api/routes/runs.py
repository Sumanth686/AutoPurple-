from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import SimulationRun
from datetime import datetime

router = APIRouter(prefix="/api/runs", tags=["Simulation Runs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RunCreate(BaseModel):
    name: str
    technique_id: str

@router.get("/")
def get_all_runs(db: Session = Depends(get_db)):
    runs = db.query(SimulationRun).all()
    return {"runs": runs, "total": len(runs)}

@router.post("/")
def create_run(run: RunCreate, db: Session = Depends(get_db)):
    new_run = SimulationRun(
        name=run.name,
        technique_id=run.technique_id,
        status="running",
        coverage_score=0.0,
        created_at=datetime.utcnow()
    )
    db.add(new_run)
    db.commit()
    db.refresh(new_run)
    return new_run

@router.get("/{run_id}/score")
def get_score(run_id: int, db: Session = Depends(get_db)):
    run = db.query(SimulationRun).filter(SimulationRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Not found")
    return {"run_id": run_id, "coverage_score": run.coverage_score}
