from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class SimulationRun(Base):
    __tablename__ = "simulation_runs"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    technique_id = Column(String)
    status = Column(String, default="pending")
    coverage_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class DetectionResult(Base):
    __tablename__ = "detection_results"
    id = Column(Integer, primary_key=True)
    run_id = Column(Integer)
    technique_id = Column(String)
    detected = Column(String)
    alert_time = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

