import React, { useState, useEffect } from "react";
import { getRuns, createRun } from "../api/api";

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [status, setStatus] = useState("Loading...");

  const load = () => {
    getRuns()
      .then((res) => {
        setRuns(res.data.runs);
        setStatus("Connected");
      })
      .catch(() => setStatus("API not connected"));
  };

  useEffect(() => { load(); }, []);

  const newRun = () => {
    createRun({ name: "Test Run", technique_id: "T1059.001" }).then(load);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-400">AutoPurple</h1>
      <p className="mt-2 text-green-400">Status: {status}</p>
      <button onClick={newRun} className="mt-4 px-4 py-2 bg-blue-600 rounded">
        New Simulation Run
      </button>
      <div className="mt-6 space-y-2">
        {runs.map((run) => (
          <div key={run.id} className="bg-gray-800 p-4 rounded">
            <p className="font-bold">{run.name}</p>
            <p className="text-sm text-yellow-400">Score: {run.coverage_score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
