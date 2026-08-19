// components/analytics/StatusBarChart.tsx
// Bar chart for the approvals breakdown — colours match StatusBadge exactly
// so this chart and the pills elsewhere in the app read as the same system.
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { StatusCount, ProjectStatus } from "@/types";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "#94A3B8", // matches StatusBadge's slate
  in_review: "#D97706", // matches StatusBadge's amber
  changes_requested: "#E11D48", // matches StatusBadge's rose
  approved: "#059669", // matches StatusBadge's emerald
};
const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
};

export default function StatusBarChart({ data, height = 260 }: { data: StatusCount[]; height?: number }) {
  const chartData = data.map((d) => ({ ...d, label: STATUS_LABELS[d.status] }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E8F0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#8A8EA0" }}
            axisLine={{ stroke: "#E7E8F0" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#8A8EA0" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E7E8F0", fontSize: 12 }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
