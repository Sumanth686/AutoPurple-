import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#22d3ee", "#334155"];

export default function DetectionAnalytics({ runs = [] }) {
  const analytics = useMemo(() => {
    const completed = runs.filter(
      (run) => run.status === "completed"
    );

    const detected = completed.filter(
      (run) => Number(run.coverage_score || 0) > 0
    ).length;

    const techniqueMap = {};

    runs.forEach((run) => {
      const technique = run.technique_id || "Unknown";

      if (!techniqueMap[technique]) {
        techniqueMap[technique] = {
          technique,
          detected: 0,
          missed: 0,
        };
      }

      if (
        run.status === "completed" &&
        Number(run.coverage_score || 0) > 0
      ) {
        techniqueMap[technique].detected += 1;
      } else if (run.status === "completed") {
        techniqueMap[technique].missed += 1;
      }
    });

    const trend = [...runs]
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      )
      .map((run, index) => ({
        name: `Run ${index + 1}`,
        coverage: Math.round(
          Number(run.coverage_score || 0) * 100
        ),
      }));

    return {
      pie: [
        {
          name: "Detected",
          value: detected,
        },
        {
          name: "Missed",
          value: Math.max(completed.length - detected, 0),
        },
      ],
      techniques: Object.values(techniqueMap),
      trend,
    };
  }, [runs]);

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Detection distribution
          </h2>

          <p className="text-sm text-slate-500">
            Detected versus missed completed simulations
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.pie}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
              >
                {analytics.pie.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            ATT&CK technique results
          </h2>

          <p className="text-sm text-slate-500">
            Detection performance by technique
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.techniques}>
              <CartesianGrid
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="technique"
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: "#94a3b8",
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#e2e8f0",
                }}
              />

              <Bar
                dataKey="detected"
                name="Detected"
                fill="#34d399"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="missed"
                name="Missed"
                fill="#f87171"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 lg:col-span-2">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Coverage trend
          </h2>

          <p className="text-sm text-slate-500">
            Coverage score across simulation runs
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.trend}>
              <CartesianGrid
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: "#94a3b8",
                }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fill: "#94a3b8",
                }}
                unit="%"
              />

              <Tooltip
                formatter={(value) => [
                  `${value}%`,
                  "Coverage",
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#e2e8f0",
                }}
              />

              <Line
                type="monotone"
                dataKey="coverage"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{
                  fill: "#22d3ee",
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
