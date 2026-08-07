from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.models import SimulationRun, DetectionResult


router = APIRouter(
    prefix="/api/runs",
    tags=["Simulation Runs"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class RunCreate(BaseModel):
    name: str
    technique_id: str


class DetectionCreate(BaseModel):
    technique_id: str
    detected: bool
    alert_time: float = 0.0


@router.get("/")
def get_all_runs(db: Session = Depends(get_db)):
    runs = db.query(SimulationRun).all()
    return {
        "runs": runs,
        "total": len(runs)
    }


@router.post("/")
def create_run(
    run: RunCreate,
    db: Session = Depends(get_db)
):
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
def get_score(
    run_id: int,
    db: Session = Depends(get_db)
):
    run = db.query(SimulationRun).filter(
        SimulationRun.id == run_id
    ).first()

    if not run:
        raise HTTPException(
            status_code=404,
            detail="Run not found"
        )

    return {
        "run_id": run_id,
        "coverage_score": run.coverage_score
    }


@router.post("/{run_id}/detection")
def record_detection(
    run_id: int,
    detection: DetectionCreate,
    db: Session = Depends(get_db)
):
    run = db.query(SimulationRun).filter(
        SimulationRun.id == run_id
    ).first()

    if not run:
        raise HTTPException(
            status_code=404,
            detail="Run not found"
        )

    detection_result = DetectionResult(
        run_id=run_id,
        technique_id=detection.technique_id,
        detected="true" if detection.detected else "false",
        alert_time=detection.alert_time,
        created_at=datetime.utcnow()
    )

    if detection.detected:
        run.coverage_score = 1.0
    else:
        run.coverage_score = 0.0

    run.status = "completed"

    db.add(detection_result)
    db.commit()
    db.refresh(run)

    return {
        "run_id": run_id,
        "status": run.status,
        "coverage_score": run.coverage_score,
        "detection": detection.detected
    }
