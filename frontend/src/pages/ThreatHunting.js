import React, { useState, useEffect } from "react";
import { getHunts, createHunt, escalateHunt } from "../api/api";

export default function ThreatHunting() {
  const [hunts, setHunts] = useState([]);
  const [form, setForm] = useState({ title: "", hypothesis: "", technique_id: "" });

  const load = () => getHunts().then((res) => setHunts(res.data.hunts));

  useEffect(() => { load(); }, []);

  const submit = () => createHunt(form).then(load);
  const escalate = (id) => escalateHunt(id).then(load);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-blue-400">Threat Hunting</h1>
      <div className="mt-4 space-y-2">
        <input placeholder="Hunt title" onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full" />
        <input placeholder="Hypothesis" onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full" />
        <input placeholder="ATT&CK ID e.g. T1059.001" onChange={(e) => setForm({ ...form, technique_id: e.target.value })}
          className="bg-gray-700 p-2 rounded w-full" />
        <button onClick={submit} className="bg-blue-600 px-4 py-2 rounded">Create Hunt</button>
      </div>
      <div className="mt-6 space-y-2">
        {hunts.map((h) => (
          <div key={h.id} className="bg-gray-800 p-4 rounded">
            <p className="font-bold">{h.title}</p>
            <p className="text-sm text-gray-400">{h.hypothesis}</p>
            <p className="text-xs text-yellow-400">{h.technique_id} - {h.status}</p>
            {h.status !== "escalated" && (
              <button onClick={() => escalate(h.id)} className="mt-2 text-xs bg-red-700 px-3 py-1 rounded">
                Escalate to Case
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
