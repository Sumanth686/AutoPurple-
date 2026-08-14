# AutoPurple
AutoPurple is a purple-team detection operations platform that connects ATT&CK-mapped attack simulations with Wazuh security monitoring. It launches Atomic Red Team tests, tracks simulation runs, checks detection evidence, and presents coverage results in a React dashboard.

Features
Launch ATT&CK technique simulations from the dashboard.

Execute Atomic Red Team tests through PowerShell.

Monitor Wazuh alerts for detection evidence.

Classify completed simulations as true positives or false negatives.

Display detection coverage and simulation status.

Show true-positive, false-negative, false-positive, and true-negative outcome cards.

Visualize detection posture, technique results, and coverage trends.

Provide recommendations for improving detection coverage.

Architecture
text
React dashboard :3000
        |
        | REST API
        v
FastAPI backend :8000
        |
        +--> PowerShell / Atomic Red Team
        |
        +--> Wazuh manager alerts
        |
        +--> In-memory simulation results
Technology Stack
React

Tailwind CSS

Recharts

FastAPI

Python

PowerShell

Atomic Red Team

Wazuh

Docker

MITRE ATT&CK

Project Structure
text
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
Requirements
Linux host, tested with Kali Linux.

Python 3.10 or newer.

Node.js and npm.

Docker and Docker Compose.

PowerShell (pwsh).

Atomic Red Team and its atomics.

A running Wazuh manager container.

Start Wazuh
Start your Wazuh deployment using the compose file for your installation. For example:

bash
cd ~/AutoPurple-/lab/wazuh-docker/single-node
sudo docker compose up -d
sudo docker compose ps
Confirm that the Wazuh manager, indexer, and dashboard services are running.

The backend currently checks the Wazuh manager container named:

text
single-node-wazuh.manager-1
If your container has a different name, update the container name in backend/app/api/routes/runs.py.

Start the Backend
bash
cd ~/AutoPurple-/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
The API will be available at:

API root: http://localhost:8000

Health endpoint: http://localhost:8000/health

Interactive API documentation: http://localhost:8000/docs

If the project does not yet contain a requirements file, install the core packages:

bash
pip install fastapi uvicorn pydantic
Start the Frontend
In a second terminal:

bash
cd ~/AutoPurple-/frontend
npm install
npm start
Open the dashboard at:

text
http://localhost:3000
Run a Simulation
Open the AutoPurple dashboard.

Select New simulation.

Enter a simulation name.

Enter an ATT&CK technique ID, such as T1059.004.

Wait for the run to finish.

Refresh the dashboard if necessary.

Review the status, coverage score, and outcome classification.

The backend launches the first Atomic Red Team test for the selected technique:

powershell
Invoke-AtomicTest T1059.004 -TestNumbers 1 -Confirm:$false
Only run simulations in an isolated lab or on systems you own and are authorized to test.

API Endpoints
List runs
text
GET /api/runs/
Returns all simulation runs and the total number of runs.

Create a run
text
POST /api/runs/
Content-Type: application/json
Example request:

json
{
  "name": "Linux Bash Detection Test",
  "technique_id": "T1059.004"
}
Get a run score
text
GET /api/runs/{run_id}/score
Get outcome statistics
text
GET /api/runs/stats/summary
Example response:

json
{
  "true_positive": 1,
  "false_negative": 0,
  "false_positive": 0,
  "true_negative": 0,
  "errors": 0,
  "pending": 0,
  "coverage_percent": 100.0
}
Get recommendations
text
GET /api/runs/{run_id}/recommendations
Detection Outcomes
Outcome	Meaning
True positive	An Atomic Red Team test ran and a matching Wazuh alert was found.
False negative	An Atomic Red Team test ran successfully but no matching Wazuh alert was found.
False positive	An alert was generated without a corresponding authorized simulation.
True negative	No test was run and no alert was generated during a defined quiet period.
The current run-based implementation calculates true positives and false negatives from simulation results. False positives and true negatives require a defined baseline or alert-reconciliation process; they should not be interpreted as meaningful until that process is implemented and populated with evidence.

How Detection Checking Works
After the Atomic Red Team command finishes successfully, the backend waits briefly for Wazuh ingestion and searches the latest manager alerts:

text
/var/ossec/logs/alerts/alerts.json
A matching technique identifier produces:

text
status: completed
detected: true
coverage_score: 1.0
result: true_positive
If the test completes but no matching alert is found:

text
status: completed
detected: false
coverage_score: 0.0
result: false_negative
Dashboard Metrics
The dashboard displays:

Detection coverage.

Completed runs.

Active simulations.

Detected runs.

True positives.

False negatives.

False positives.

True negatives.

Detection posture.

Coverage trend.

ATT&CK technique results.

Troubleshooting
Backend is not reachable
Check that the backend is running:

bash
curl http://localhost:8000/health
Then check the frontend API URL and restart the React development server.

A run remains at 0% coverage
Check the backend terminal for errors and verify that the Wazuh container is running:

bash
sudo docker ps
Check recent Wazuh alerts:

bash
sudo docker exec -u 0 single-node-wazuh.manager-1 \
  sh -c "tail -n 50 /var/ossec/logs/alerts/alerts.json"
Confirm that the alert contains the expected ATT&CK technique identifier.

The Wazuh container name is different
List container names:

bash
docker ps --format '{{.Names}}'
Update the container name used by check_wazuh_detection() in:

text
backend/app/api/routes/runs.py
The dashboard does not show new values
Click Refresh.

Confirm that the browser is using the current frontend build.

Check the browser developer console for API or CORS errors.

Verify the statistics endpoint directly:

bash
curl -s http://localhost:8000/api/runs/stats/summary
Existing runs still show old fields
Runs created before the detection-classification patch may not contain detected or result. Create a new simulation after restarting the backend.

Git Workflow
Check the working tree:

bash
git status
Commit changes:

bash
git add backend/app/api/routes/runs.py \
        frontend/src/pages/Dashboard.js \
        .gitignore
git commit -m "Add Wazuh detection results and dashboard outcome metrics"
Push to GitHub:

bash
git push origin main
Verify the repository is clean:

bash
git status
Expected output:

text
nothing to commit, working tree clean
Security Notes
Run Atomic Red Team tests only in an authorized lab environment.

Do not expose the development API directly to the public internet.

Do not commit credentials, API keys, passwords, certificates, or .env files.

Review and restrict sudo docker permissions in production.

Replace the in-memory runs_db with PostgreSQL or another persistent database before production use.

Add authentication and authorization before deploying outside a trusted lab.

Treat Wazuh alert matching as evidence-based telemetry, not as proof that every test was fully detected.

Project Status
The current implementation provides a working local demonstration of:

text
ATT&CK technique
    → Atomic Red Team test
    → Wazuh alert monitoring
    → Detection classification
    → Coverage score
    → React dashboard
Recommended next improvements are persistent database storage, precise alert correlation using timestamps and run IDs, real false-positive reconciliation, quiet-period baselines for true negatives, authentication, and automated tests.# AutoPurple+
