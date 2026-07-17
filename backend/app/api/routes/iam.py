from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from app.api.routes.cases import cases_db

router = APIRouter(prefix="/api/iam", tags=["iam"])
iam_findings_db = []

class IAMFindingCreate(BaseModel):
    user_or_role: str
    issue: str
    severity: str
    recommendation: str

@router.get("/")
def get_iam_findings():
    return {"findings": iam_findings_db}

@router.post("/")
def create_iam_finding(finding: IAMFindingCreate):
    new_finding = {
        "id": len(iam_findings_db) + 1,
        "user_or_role": finding.user_or_role,
        "issue": finding.issue,
        "severity": finding.severity,
        "recommendation": finding.recommendation,
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }
    iam_findings_db.append(new_finding)
    return new_finding

@router.patch("/{finding_id}/resolve")
def resolve_finding(finding_id: int):
    finding = next((f for f in iam_findings_db if f["id"] == finding_id), None)
    if finding:
        finding["status"] = "resolved"
    return finding

@router.post("/{finding_id}/escalate")
def escalate_finding_to_case(finding_id: int):
    finding = next((f for f in iam_findings_db if f["id"] == finding_id), None)
    if not finding:
        return {"error": "Finding not found"}
    new_case = {
        "id": len(cases_db) + 1,
        "title": f"IAM Risk: {finding['issue']}",
        "description": f"{finding['user_or_role']} - {finding['recommendation']}",
        "related_technique_id": "T1078",
        "priority": finding["severity"],
        "status": "open",
        "source": "iam_audit",
        "created_at": datetime.utcnow().isoformat()
    }
    cases_db.append(new_case)
    finding["status"] = "escalated"
    return new_case