from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import json
import subprocess
import time

router = APIRouter(prefix='/api/runs', tags=['Simulation Runs'])
runs_db = []

# Atomic Red Team test number to run for each technique (must be a Linux-compatible test)
LINUX_TEST_NUMBERS = {
    "T1059.004": 1,
    "T1082": 3,
    "T1105": 27,
}

class RunCreate(BaseModel):
    name: str
    technique_id: str

def check_wazuh_detection(technique_id: str, since: datetime, attempts: int = 6, delay: int = 5) -> bool:
    """True only if a Wazuh alert tagged with this MITRE technique fired after `since`."""
    for _ in range(attempts):
        try:
            result = subprocess.run(
                ["sudo", "docker", "exec", "-u", "0", "single-node-wazuh.manager-1",
                 "tail", "-n", "5000", "/var/ossec/logs/alerts/alerts.json"],
                capture_output=True, text=True, timeout=15
            )
            for line in result.stdout.splitlines():
                if "alerts.json" in line:
                    continue  # ignore alerts caused by this check (or manual checks) reading the alert log
                try:
                    alert = json.loads(line)
                except ValueError:
                    continue
                mitre_ids = alert.get("rule", {}).get("mitre", {}).get("id", [])
                if isinstance(mitre_ids, str):
                    mitre_ids = [mitre_ids]
                if technique_id not in mitre_ids:
                    continue
                fired_at = datetime.strptime(alert["timestamp"], "%Y-%m-%dT%H:%M:%S.%f%z")
                if fired_at >= since:
                    return True
        except Exception:
            pass
        time.sleep(delay)
    return False

def execute_atomic_test(run_id: int, technique_id: str):
    test_number = LINUX_TEST_NUMBERS.get(technique_id, 1)
    command = (
        f'$ErrorActionPreference = "Stop"; '
        f'Import-Module "~/AtomicRedTeam/invoke-atomicredteam/Invoke-AtomicRedTeam.psd1" -Force; '
        f'Invoke-AtomicTest {technique_id} -TestNumbers {test_number} -Confirm:$false'
    )
    run = next((r for r in runs_db if r['id'] == run_id), None)
    started = datetime.now(timezone.utc) - timedelta(seconds=2)
    try:
        result = subprocess.run(
            ["pwsh", "-NonInteractive", "-Command", command],
            capture_output=True, text=True, timeout=90, stdin=subprocess.DEVNULL
        )
        if run:
            if result.returncode == 0:
                detected = check_wazuh_detection(technique_id, started)
                run['status'] = 'completed'
                run['detected'] = detected
                run['coverage_score'] = 1.0 if detected else 0.0
                run['result'] = 'true_positive' if detected else 'false_negative'
            else:
                run['status'] = 'failed'
                run['detected'] = False
                run['coverage_score'] = 0.0
                run['result'] = 'error'
            run['output'] = (result.stdout + result.stderr)[-2000:]
    except subprocess.TimeoutExpired:
        if run:
            run['status'] = 'failed'
            run['detected'] = False
            run['coverage_score'] = 0.0
            run['result'] = 'error'
            run['output'] = 'Timed out after 90s - test likely required interactive input'
    except Exception as e:
        if run:
            run['status'] = 'error'
            run['detected'] = False
            run['coverage_score'] = 0.0
            run['result'] = 'error'
            run['output'] = str(e)

@router.get('/')
def get_all_runs():
    return {'runs': runs_db, 'total': len(runs_db)}

@router.post('/')
def create_run(run: RunCreate, background_tasks: BackgroundTasks):
    new_run = {
        'id': len(runs_db) + 1,
        'name': run.name,
        'technique_id': run.technique_id,
        'status': 'running',
        'coverage_score': 0.0,
        'detected': None,
        'result': 'pending',
        'created_at': datetime.utcnow().isoformat()
    }
    runs_db.append(new_run)
    background_tasks.add_task(execute_atomic_test, new_run['id'], run.technique_id)
    return new_run

@router.get('/{run_id}/score')
def get_score(run_id: int):
    run = next((r for r in runs_db if r['id'] == run_id), None)
    if not run:
        raise HTTPException(404, 'Not found')
    return {'run_id': run_id, 'coverage_score': run['coverage_score'], 'status': run.get('status')}

@router.get('/stats/summary')
def get_stats_summary():
    tp = sum(1 for r in runs_db if r.get('result') == 'true_positive')
    fn = sum(1 for r in runs_db if r.get('result') == 'false_negative')
    errors = sum(1 for r in runs_db if r.get('result') == 'error')
    pending = sum(1 for r in runs_db if r.get('result') == 'pending')
    total_completed = tp + fn
    coverage_pct = round((tp / total_completed) * 100, 1) if total_completed else 0.0
    return {
        'true_positive': tp, 'false_negative': fn,
        'false_positive': 0, 'true_negative': 0,
        'errors': errors, 'pending': pending,
        'coverage_percent': coverage_pct
    }

@router.get('/{run_id}/recommendations')
def get_recommendations(run_id: int):
    return {'recommendations': [
        {'priority': 'HIGH', 'technique': 'T1059.001', 'action': 'Create Wazuh rule for PowerShell execution'},
        {'priority': 'MEDIUM', 'technique': 'T1021.002', 'action': 'Enable SMB anomaly detection rule'}
    ]}
