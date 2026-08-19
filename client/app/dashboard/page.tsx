// app/dashboard/page.tsx
// The new landing spot after login — stats + a growth chart + a peek at
// recent projects. The full project list now lives at /dashboard/projects.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import StatCard from "@/components/analytics/StatCard";
import GrowthLineChart from "@/components/analytics/GrowthLineChart";
import ProjectRow from "@/components/dashboard/ProjectRow";
import type { AnalyticsOverview, Project } from "@/types";

export default function DashboardOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("there");

  useEffect(() => {
    setFirstName(getUser()?.name?.split(" ")[0] || "there");
    Promise.all([api.getAnalytics(), api.listProjects()])
      .then(([overview, projects]) => {
        setAnalytics(overview);
        setRecentProjects(projects.slice(0, 5));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, []);

  if (error) {
    return <p className="p-10 text-sm text-rose-600">{error}</p>;
  }
  if (!analytics || !recentProjects) {
    return <Spinner />;
  }

  const pendingProjects = analytics.totalProjects - analytics.approvedProjects;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Welcome back, {firstName}</h1>
        <p className="text-sm text-slate-500">Here's how things are going across your projects.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total projects" value={analytics.totalProjects} />
        <StatCard
          label="Approved"
          value={analytics.approvedProjects}
          hint={`${pendingProjects} awaiting a decision`}
        />
        <StatCard label="Clients" value={analytics.totalClients} />
      </div>

      <Card className="mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Client growth</h2>
          <Link href="/dashboard/analytics" className="text-xs font-medium text-indigo-600 hover:underline">
            View full analytics →
          </Link>
        </div>
        <GrowthLineChart data={analytics.clientGrowth} xKey="month" yKey="clients" color="#4f46e5" height={220} />
      </Card>

      <Card>
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-sm font-semibold text-slate-800">Recent projects</h2>
          <Link href="/dashboard/projects" className="text-xs font-medium text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <p className="p-5 text-sm text-slate-400">No projects yet.</p>
        ) : (
          <div className="mt-2">
            {recentProjects.map((p) => (
              <ProjectRow key={p._id} project={p} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
