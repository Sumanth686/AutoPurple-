# AutoPurple

AutoPurple is a purple-team detection operations platform that connects MITRE ATT&CK-mapped attack simulations with Wazuh security monitoring.

The platform launches Atomic Red Team tests, tracks simulation runs, checks Wazuh detection evidence, calculates coverage scores, and displays results in a React dashboard.

## Features

- Launch ATT&CK technique simulations from the dashboard.
- Execute Atomic Red Team tests through PowerShell.
- Monitor Wazuh alerts for detection evidence.
- Track simulation status and execution output.
- Calculate detection coverage scores.
- Classify results as true positives or false negatives.
- Display true-positive, false-negative, false-positive, and true-negative metrics.
- Visualize detection posture and coverage trends.
- Show ATT&CK technique results.
- Provide detection-improvement recommendations.
- Integrate React, FastAPI, Wazuh, Docker, and Atomic Red Team.

## Architecture

```text
React Dashboard :3000
        |
        | REST API
        v
FastAPI Backend :8000
        |
        +--> PowerShell / Atomic Red Team
        |
        +--> Wazuh Manager Alerts
        |
        +--> Simulation Results
```

## Technology Stack

- React
- Tailwind CSS
- Recharts
- FastAPI
- Python
- PowerShell
- Atomic Red Team
- Wazuh
- Docker
- MITRE ATT&CK
- Git and GitHub

## Project Structure

```text
AutoPurple-/
├── backend/
│   └── app/
│       ├── api/
│       │   └── routes/
│       │       └── runs.py
│       └── main.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   └── DetectionAnalytics.js
│   │   └── pages/
│   │       └── Dashboard.js
│   └── package.json
├── lab/
│   └── wazuh-docker/
└── README.md
```

## Requirements

- Linux host, tested with Kali Linux.
- Python 3.10 or newer.
- Node.js and npm.
- Docker and Docker Compose.
- PowerShell (`pwsh`).
- Atomic Red Team and its atomics.
- A running Wazuh manager.
- Permission to run authorized security tests.

## Start Wazuh

Start your Wazuh deployment using the Docker Compose configuration for your installation.

Example:

```bash
cd ~/AutoPurple-/lab/wazuh-docker/single-node
sudo docker compose up -d
sudo docker compose ps
```

Confirm that the Wazuh manager, indexer, and dashboard containers are running.

The backend currently expects the Wazuh manager container to be named:

```text
single-node-wazuh.manager-1
```

If your container has a different name, update the container name in:

```text
backend/app/api/routes/runs.py
```

List your container names with:

```bash
docker ps --format '{{.Names}}'
```

## Start the Backend

Open a terminal and run:

```bash
cd ~/AutoPurple-/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

Useful backend URLs:

```text
http://localhost:8000/health
http://localhost:8000/docs
```

If `requirements.txt` is not available, install the core packages:

```bash
pip install fastapi uvicorn pydantic
```

## Start the Frontend

Open a second terminal:

```bash
cd ~/AutoPurple-/frontend
npm install
npm start
```

Open the dashboard:

```text
http://localhost:3000
```

## Run a Simulation

1. Open the AutoPurple dashboard.
2. Click **New simulation**.
3. Enter a simulation name.
4. Enter an ATT&CK technique ID.
5. Wait for the simulation to finish.
6. Click **Refresh** if required.
7. Review the status, coverage score, and detection outcome.

Example technique:

```text
T1059.004
```

The backend executes an Atomic Red Team test similar to:

```powershell
Invoke-AtomicTest T1059.004 -TestNumbers 1 -Confirm:$false
```

Only run simulations in an isolated environment or on systems that you own or are explicitly authorized to test.

## API Endpoints

### List Simulation Runs

```http
GET /api/runs/
```

Returns all simulation runs.

Example:

```bash
curl http://localhost:8000/api/runs/
```

### Create a Simulation Run

```http
POST /api/runs/
Content-Type: application/json
```

Example request:

```json
{
  "name": "Linux Bash Detection Test",
  "technique_id": "T1059.004"
}
```

Example with curl:

```bash
curl -X POST http://localhost:8000/api/runs/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Linux Bash Detection Test","technique_id":"T1059.004"}'
```

### Get a Run Score

```http
GET /api/runs/{run_id}/score
```

Example:

```bash
curl http://localhost:8000/api/runs/1/score
```

### Get Outcome Statistics

```http
GET /api/runs/stats/summary
```

Example:

```bash
curl http://localhost:8000/api/runs/stats/summary
```

Example response:

```json
{
  "true_positive": 1,
  "false_negative": 0,
  "false_positive": 0,
  "true_negative": 0,
  "errors": 0,
  "pending": 0,
  "coverage_percent": 100.0
}
```

### Get Recommendations

```http
GET /api/runs/{run_id}/recommendations
```

Example:

```bash
curl http://localhost:8000/api/runs/1/recommendations
```

## Detection Outcomes

| Outcome | Meaning |
|---|---|
| True positive | The Atomic Red Team test ran and a matching Wazuh alert was found. |
| False negative | The test ran successfully but no matching Wazuh alert was found. |
| False positive | Wazuh generated an alert without a corresponding authorized simulation. |
| True negative | No simulation ran and no alert was generated during a defined quiet period. |

The current implementation calculates true positives and false negatives from simulation results.

False positives and true negatives require a separate alert-reconciliation process and a defined quiet-period baseline. Until that process is implemented, those values should be treated as baseline placeholders rather than complete statistical measurements.

## Detection Workflow

```text
1. User selects an ATT&CK technique.
2. FastAPI creates a simulation run.
3. PowerShell launches Atomic Red Team.
4. Atomic Red Team executes the selected test.
5. Wazuh monitors the host activity.
6. Wazuh writes alerts to alerts.json.
7. The backend checks for matching detection evidence.
8. The run receives a score and outcome classification.
9. React displays the result in the dashboard.
```

## Detection Scoring

A detected simulation receives:

```text
coverage_score = 1.0
```

A completed simulation without a matching alert receives:

```text
coverage_score = 0.0
```

The dashboard converts these values to percentages:

```text
1.0 = 100%
0.5 = 50%
0.0 = 0%
```

## Dashboard Metrics

The dashboard displays:

- Detection coverage.
- Completed runs.
- Active simulations.
- Detected runs.
- True positives.
- False negatives.
- False positives.
- True negatives.
- Detection posture.
- Coverage trend.
- ATT&CK technique results.
- Simulation execution status.
- Wazuh detection evidence.

## Check Wazuh Alerts

To inspect recent alerts:

```bash
sudo docker exec -u 0 single-node-wazuh.manager-1 \
  sh -c "tail -n 50 /var/ossec/logs/alerts/alerts.json"
```

To search for a technique:

```bash
sudo docker exec -u 0 single-node-wazuh.manager-1 \
  sh -c "grep -i 'T1059.004' /var/ossec/logs/alerts/alerts.json | tail -n 20"
```

## Troubleshooting

### Backend Is Not Reachable

Check the backend health endpoint:

```bash
curl http://localhost:8000/health
```

If it fails, start the backend:

```bash
cd ~/AutoPurple-/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Wazuh Container Is Not Running

Check Docker:

```bash
sudo docker ps
```

Start the Wazuh services:

```bash
cd ~/AutoPurple-/lab/wazuh-docker/single-node
sudo docker compose up -d
```

### Coverage Remains at 0%

Check the following:

- The Atomic Red Team test completed successfully.
- The Wazuh manager is running.
- The backend is using the correct Wazuh container name.
- The alert file contains recent entries.
- The ATT&CK technique ID matches the generated alert.
- The dashboard was refreshed after completion.

Check the API directly:

```bash
curl -s http://localhost:8000/api/runs/
```

Check outcome statistics:

```bash
curl -s http://localhost:8000/api/runs/stats/summary
```

### Dashboard Does Not Update

Try the following:

```text
1. Click Refresh in the dashboard.
2. Reload the browser page.
3. Check the browser developer console.
4. Confirm that the backend is running on port 8000.
5. Confirm that the frontend is running on port 3000.
```

### Wazuh Container Name Is Different

List container names:

```bash
docker ps --format '{{.Names}}'
```

Update the container name used in:

```text
backend/app/api/routes/runs.py
```

## Git Workflow

Check the working tree:

```bash
git status
```

Stage the project files:

```bash
git add backend/app/api/routes/runs.py \
        frontend/src/pages/Dashboard.js \
        .gitignore \
        README.md
```

Commit the changes:

```bash
git commit -m "Document AutoPurple detection platform"
```

Push to GitHub:

```bash
git push origin main
```

Verify that the repository is clean:

```bash
git status
```

Expected result:

```text
nothing to commit, working tree clean
```

## Security Notes

- Run Atomic Red Team tests only in an authorized lab environment.
- Do not run tests against systems without permission.
- Do not expose the development API directly to the public internet.
- Do not commit passwords, API keys, certificates, or `.env` files.
- Review Docker and sudo permissions before production use.
- Add authentication and authorization before public deployment.
- Replace the in-memory `runs_db` with PostgreSQL for persistent storage.
- Use precise timestamps or run identifiers when correlating alerts.
- Treat Wazuh alert matching as evidence-based telemetry.
- Keep Wazuh and Atomic Red Team components updated.

## Future Improvements

- Persistent PostgreSQL storage.
- User authentication and role-based access control.
- Accurate alert correlation using timestamps and run IDs.
- Real false-positive reconciliation.
- Quiet-period baselines for true-negative measurements.
- Detection rule management.
- Detailed alert evidence pages.
- Exportable assessment reports.
- Automated backend and frontend tests.
- CI/CD security scanning.
- Containerized one-command deployment.

## Project Status

AutoPurple currently demonstrates the following workflow:

```text
ATT&CK Technique
        |
        v
Atomic Red Team Simulation
        |
        v
Wazuh Monitoring
        |
        v
Detection Evidence
        |
        v
Coverage Score
        |
        v
React Dashboard
```

AutoPurple is intended for authorized defensive security testing, purple-team exercises, detection engineering, and academic demonstration.
