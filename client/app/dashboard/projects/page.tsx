// app/dashboard/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ProjectRow from "@/components/dashboard/ProjectRow";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load projects"));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Everything you're sharing with clients.</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>New project</Button>
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      {!projects && !error && <Spinner />}

      {projects && projects.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-sm text-slate-500">No projects yet.</p>
          <Link href="/dashboard/projects/new" className="mt-3 inline-block">
            <Button size="sm">Create your first project</Button>
          </Link>
        </Card>
      )}

      {projects && projects.length > 0 && (
        <Card>
          {projects.map((p) => (
            <ProjectRow key={p._id} project={p} />
          ))}
        </Card>
      )}
    </div>
  );
}
