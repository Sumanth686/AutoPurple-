import React, { useEffect, useMemo, useState } from "react";
import { getRuns, createRun } from "../api/api";
import DetectionAnalytics from "../components/DetectionAnalytics";

const statusStyles = {
  completed:
    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  running:
    "bg-amber-500/15 text-amber-300 border-amber-500/30",
  failed:
    "bg-red-500/15 text-red-300 border-red-500/30",
};

function MetricCard({
  label,
  value,
  detail,
  color = "cyan",
}) {
  const colors = {
    cyan: "text-cyan-300",
    green: "text-emerald-300",
    amber: "text-amber-300",
    red: "text-red-300",
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
      <p className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className={`mt-3 text-3xl font-semibold ${colors[color]}`}>
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-400">
        {detail}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ||
        "border-slate-600 bg-slate-800 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [filter, setFilter] = useState("all");
  const [creating, setCreating] = useState(false);

  const load = () => {
    getRuns()
      .then((res) => {
        setRuns(res.data.runs || []);
        setStatus("Connected");
      })
      .catch(() => {
        setStatus("API not connected");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const newRun = () => {
    setCreating(true);

    createRun({
      name: "Linux Bash Detection Test",
      technique_id: "T1059.004",
    })
      .then(load)
      .finally(() => {
        setCreating(false);
      });
  };

  const metrics = useMemo(() => {
    const completed = runs.filter(
      (run) => run.status === "completed"
    );

    const running = runs.filter(
      (run) => run.status === "running"
    );

    const detected = completed.filter(
      (run) => Number(run.coverage_score || 0) > 0
    );

    const coverage = completed.length
      ? Math.round(
          (completed.reduce(
            (sum, run) =>
              sum + Number(run.coverage_score || 0),
            0
          ) /
            completed.length) *
            100
        )
      : 0;

    return {
      completed: completed.length,
      running: running.length,
      detected: detected.length,
      coverage,
    };
  }, [runs]);

  const visibleRuns =
    filter === "all"
      ? runs
      : runs.filter((run) => run.status === filter);

  const detectionPercent = metrics.completed
    ? Math.round(
        (metrics.detected / metrics.completed) * 100
      )
    : 0;

  return (
    <main className="min-h-screen bg-[#080d1a] px-4 py-6 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-5 border-b border-slate-800 pb-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                ◈
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  AutoPurple
                </h1>

                <p className="text-sm text-slate-500">
                  Purple-team detection operations
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1.5 text-sm ${
                status === "Connected"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              <span className="mr-2">●</span>
              {status}
            </span>

            <button
              onClick={load}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Refresh
            </button>

            <button
              onClick={newRun}
              disabled={creating}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Starting..." : "New simulation"}
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Detection coverage"
            value={`${metrics.coverage}%`}
            detail="Average completed-run coverage"
            color="cyan"
          />

          <MetricCard
            label="Completed runs"
            value={metrics.completed}
            detail="Validated simulation results"
            color="green"
          />

          <MetricCard
            label="Active simulations"
            value={metrics.running}
            detail="Awaiting detection evidence"
            color="amber"
          />

          <MetricCard
            label="Detections"
            value={metrics.detected}
            detail="Completed runs with a match"
            color="red"
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Detection posture
                </h2>

                <p className="text-sm text-slate-500">
                  Current results from completed simulations
                </p>
              </div>

              <span className="text-sm text-slate-400">
                {metrics.detected}/{metrics.completed} detected
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row">
              <div
                className="flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#22d3ee ${detectionPercent}%, #1e293b 0)`,
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-slate-900">
                  <span className="text-3xl font-semibold text-cyan-300">
                    {detectionPercent}%
                  </span>

                  <span className="text-xs text-slate-500">
                    detected
                  </span>
                </div>
              </div>

              <div className="w-full space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">
                      Detection rate
                    </span>

                    <span className="text-cyan-300">
                      {detectionPercent}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-cyan-400 transition-all"
                      style={{
                        width: `${detectionPercent}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">
                      Technique coverage
                    </span>

                    <span className="text-emerald-300">
                      {metrics.coverage}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-emerald-400 transition-all"
                      style={{
                        width: `${metrics.coverage}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="border-l-2 border-cyan-400 pl-3 text-sm text-slate-400">
                  Run simulations to expand ATT&CK technique
                  coverage and verify Wazuh detection evidence.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
            <h2 className="text-lg font-semibold">
              System status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Connected services
            </p>

            <div className="mt-6 space-y-4">
              {[
                "API service",
                "Run database",
                "Wazuh manager",
                "Indexer",
              ].map((service) => (
                <div
                  key={service}
                  className="flex items-center justify-between border-b border-slate-800 pb-3"
                >
                  <span className="text-sm text-slate-300">
                    {service}
                  </span>

                  <span className="text-xs text-emerald-300">
                    Operational
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Simulation runs
              </h2>

              <p className="text-sm text-slate-500">
                Review ATT&CK technique execution and detection results
              </p>
            </div>

            <div className="flex gap-2">
              {[
                "all",
                "running",
                "completed",
                "failed",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-3 py-1.5 text-xs capitalize ${
                    filter === item
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-slate-800 text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-3">
                    Simulation
                  </th>

                  <th className="px-3 py-3">
                    Technique
                  </th>

                  <th className="px-3 py-3">
                    Status
                  </th>

                  <th className="px-3 py-3">
                    Coverage
                  </th>

                  <th className="px-3 py-3">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
                  >
                    <td className="px-3 py-4 font-medium text-slate-200">
                      {run.name}
                    </td>

                    <td className="px-3 py-4 font-mono text-cyan-300">
                      {run.technique_id}
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge status={run.status} />
                    </td>

                    <td className="px-3 py-4 text-slate-300">
                      {Math.round(
                        Number(run.coverage_score || 0) * 100
                      )}
                      %
                    </td>

                    <td className="px-3 py-4 text-slate-500">
                      {new Date(
                        run.created_at
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {!visibleRuns.length && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-3 py-10 text-center text-slate-500"
                    >
                      No simulation runs match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <DetectionAnalytics runs={runs} />
      </div>
    </main>
  );
}
