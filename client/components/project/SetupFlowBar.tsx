// components/project/SetupFlowBar.tsx
// Shown at the top of each content editor only when arriving from the
// post-creation "customize content now" wizard — a step indicator plus a
// "Skip this step" escape hatch (uses the template default, i.e. "common").
"use client";

import { getSetupSteps, type SetupStepId } from "@/lib/setupFlow";
import type { PageId } from "@/lib/templateEngine";

interface SetupFlowBarProps {
  pages: PageId[];
  currentStepId: SetupStepId;
  onSkip: () => void;
}

export default function SetupFlowBar({ pages, currentStepId, onSkip }: SetupFlowBarProps) {
  const steps = getSetupSteps(pages);
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-indigo-700">
          Step {currentIndex + 1} of {steps.length} — {steps[currentIndex]?.label}
        </span>
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 w-6 rounded-full ${i <= currentIndex ? "bg-indigo-600" : "bg-indigo-200"}`}
            />
          ))}
        </div>
      </div>
      <button type="button" onClick={onSkip} className="text-xs font-medium text-indigo-600 hover:underline">
        Skip this step →
      </button>
    </div>
  );
}
