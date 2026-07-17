import React, { useState, useEffect } from "react";
import { getCases, createCase, closeCase } from "../api/api";

export default function IncidentResponse() {
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", related_technique_id: "", priority: "high" });

  const load = () => getCases().then((res) => setCases(res.data.cases));

  useEffect(() => { load(); }, []);

  const submit = () => createCase(form).then(load);
  const resolve = (id) => closeCase(id).then(load);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-blue-400">Incident Response</h1>
      <div className="mt-4 space-y-2">
        <input placeholder="Case title" onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full" />
        <select onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full">
          <option value="critical">CRITICAL</option>
          <option value="high">HIGH</option>
          <option value="medium">MEDIUM</option>
          <option value="low">LOW</option>
        </select>
        <input placeholder="Technique ID e.g. T1059.001" onChange={(e) => setForm({ ...form, related_technique_id: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full" />
        <textarea placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full h-20" />
        <button onClick={submit} className="bg-blue-600 px-4 py-2 rounded">Create Case</button>
      </div>
      <div className="mt-6 space-y-3">
        {cases.map((c) => (
          <div key={c.id} className="bg-gray-800 p-4 rounded border-l-4 border-red-500">
            <div className="flex justify-between">
              <p className="font-bold">{c.title}</p>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded">{c.status}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{c.description}</p>
            <p className="text-xs text-blue-400">{c.related_technique_id} | source: {c.source || "manual"}</p>
            {c.status === "open" && (
              <button onClick={() => resolve(c.id)} className="mt-2 text-xs bg-green-700 px-3 py-1 rounded">
                Close Case
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
