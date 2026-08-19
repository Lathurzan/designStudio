// components/dashboard/ProjectRow.tsx
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Project } from "@/types";

export default function ProjectRow({ project }: { project: Project }) {
  const updated = new Date(project.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/dashboard/projects/${project._id}`}
      className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{project.name}</p>
        <p className="truncate text-xs text-slate-500">{project.clientName}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className="text-xs text-slate-400">{updated}</span>
        <StatusBadge status={project.status} />
      </div>
    </Link>
  );
}
