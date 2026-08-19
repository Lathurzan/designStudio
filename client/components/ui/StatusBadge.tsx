// components/ui/StatusBadge.tsx
import type { ProjectStatus } from "@/types";

const STYLES: Record<ProjectStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  in_review: "bg-amber-100 text-amber-700",
  changes_requested: "bg-rose-100 text-rose-700",
  approved: "bg-emerald-100 text-emerald-700",
};

const LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
};

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]} ${className}`}>
      {LABELS[status]}
    </span>
  );
}
