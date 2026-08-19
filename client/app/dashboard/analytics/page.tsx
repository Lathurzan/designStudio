// app/dashboard/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import StatCard from "@/components/analytics/StatCard";
import GrowthLineChart from "@/components/analytics/GrowthLineChart";
import StatusBarChart from "@/components/analytics/StatusBarChart";
import type { AnalyticsOverview } from "@/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAnalytics()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load analytics"));
  }, []);

  if (error) {
    return <p className="p-10 text-sm text-rose-600">{error}</p>;
  }
  if (!data) {
    return <Spinner />;
  }

  const pendingProjects = data.totalProjects - data.approvedProjects;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">How your projects and client base are trending, last 6 months.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total projects" value={data.totalProjects} />
        <StatCard
          label="Approved"
          value={data.approvedProjects}
          hint={`${pendingProjects} awaiting a decision`}
        />
        <StatCard label="Clients" value={data.totalClients} />
      </div>

      <Card className="mb-6 p-5">
        <h2 className="mb-1 text-sm font-semibold text-slate-800">Client growth</h2>
        <p className="mb-4 text-xs text-slate-400">
          Cumulative distinct clients, counted from the month their first project started.
        </p>
        <GrowthLineChart data={data.clientGrowth} xKey="month" yKey="clients" color="#4f46e5" height={280} />
      </Card>

      <Card className="mb-6 p-5">
        <h2 className="mb-1 text-sm font-semibold text-slate-800">Project growth</h2>
        <p className="mb-4 text-xs text-slate-400">Cumulative total projects created.</p>
        <GrowthLineChart data={data.projectGrowth} xKey="month" yKey="projects" color="#059669" height={280} />
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-sm font-semibold text-slate-800">Approvals</h2>
        <p className="mb-4 text-xs text-slate-400">Where every project currently stands.</p>
        <StatusBarChart data={data.statusBreakdown} height={280} />
      </Card>
    </div>
  );
}
