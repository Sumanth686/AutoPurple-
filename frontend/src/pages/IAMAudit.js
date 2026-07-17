import React, { useState, useEffect } from "react";
import { getIamFindings, createIamFinding, escalateIamFinding } from "../api/api";

export default function IAMAudit() {
  const [findings, setFindings] = useState([]);
  const [form, setForm] = useState({ user_or_role: "", issue: "", severity: "high", recommendation: "" });

  const load = () => getIamFindings().then((res) => setFindings(res.data.findings));

  useEffect(() => { load(); }, []);

  const submit = () => createIamFinding(form).then(load);
  const escalate = (id) => escalateIamFinding(id).then(load);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-blue-400">IAM Audit</h1>
      <div className="mt-4 space-y-2">
        <input placeholder="User or role" onChange={(e) => setForm({ ...form, user_or_role: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full" />
        <input placeholder="Issue" onChange={(e) => setForm({ ...form, issue: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full" />
        <select onChange={(e) => setForm({ ...form, severity: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full">
          <option value="high">HIGH</option>
          <option value="medium">MEDIUM</option>
          <option value="low">LOW</option>
        </select>
        <input placeholder="Recommendation" onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full" />
        <button onClick={submit} className="bg-blue-600 px-4 py-2 rounded">Add Finding</button>
      </div>
      <div className="mt-6 space-y-2">
        {findings.map((f) => (
          <div key={f.id} className="bg-gray-800 p-4 rounded border-l-4 border-red-500">
            <p className="font-bold text-red-400">{f.severity} - {f.user_or_role}</p>
            <p className="text-sm mt-1">{f.issue}</p>
            <p className="text-xs text-blue-400 mt-1">Fix: {f.recommendation}</p>
            {f.status !== "escalated" && (
              <button onClick={() => escalate(f.id)} className="mt-2 text-xs bg-red-700 px-3 py-1 rounded">
                Escalate to Case
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
