// components/preview/ApproveActions.tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { ProjectStatus } from "@/types";

interface ApproveActionsProps {
  status: ProjectStatus;
  onApprove: () => Promise<void> | void;
  onRequestChanges: () => Promise<void> | void;
}

type LoadingAction = "approve" | "changes" | null;

export default function ApproveActions({ status, onApprove, onRequestChanges }: ApproveActionsProps) {
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  async function run(action: LoadingAction, fn: () => Promise<void> | void) {
    setLoadingAction(action);
    try {
      await fn();
    } finally {
      setLoadingAction(null);
    }
  }

  if (status === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
        You approved this design. Thanks — development can begin.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="flex-1"
        loading={loadingAction === "approve"}
        onClick={() => run("approve", onApprove)}
      >
        Approve design
      </Button>
      <Button
        size="lg"
        variant="ghost"
        className="flex-1"
        loading={loadingAction === "changes"}
        onClick={() => run("changes", onRequestChanges)}
      >
        Request changes
      </Button>
      {status === "changes_requested" && !loadingAction && (
        <p className="w-full text-center text-xs text-slate-400 sm:text-left">
          Changes requested — your freelancer has been notified.
        </p>
      )}
    </div>
  );
}
