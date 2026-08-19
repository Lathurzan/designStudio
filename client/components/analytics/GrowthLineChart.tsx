// components/analytics/GrowthLineChart.tsx
// Generic cumulative-growth line chart — used for both "clients over time"
// and "projects over time," just pointed at different data + dataKey.
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GrowthLineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}

export default function GrowthLineChart({
  data,
  xKey,
  yKey,
  color = "#4f46e5",
  height = 260,
}: GrowthLineChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E8F0" vertical={false} />
          <XAxis
            dataKey={xKey}
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
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #E7E8F0", fontSize: 12 }}
            labelStyle={{ fontWeight: 600, color: "#11131A" }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
