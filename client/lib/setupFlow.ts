// lib/setupFlow.ts
// Shared logic for the post-creation "edit content one by one" wizard.
// Keeps step order + URLs in one place so the New Project page and all
// three content editors agree on what "next" means without duplicating it.
import type { PageId } from "./templateEngine";

export type SetupStepId = "home" | "about" | "services" | "contact" | "nav-footer";

export interface SetupStep {
  id: SetupStepId;
  label: string;
}

/** Which steps apply to this project — includes selected pages, plus Navbar & Footer. */
export function getSetupSteps(pages: PageId[]): SetupStep[] {
  const steps: SetupStep[] = [];
  if (pages.includes("home")) steps.push({ id: "home", label: "Home" });
  if (pages.includes("about")) steps.push({ id: "about", label: "About" });
  if (pages.includes("services")) steps.push({ id: "services", label: "Services" });
  if (pages.includes("contact")) steps.push({ id: "contact", label: "Contact" });
  steps.push({ id: "nav-footer", label: "Navbar & Footer" });
  return steps;
}

export function stepPath(projectId: string, stepId: SetupStepId): string {
  return `/dashboard/projects/${projectId}/edit/${stepId}?flow=setup`;
}

/** URL for whatever comes after `currentStepId` — the next step, or the finished project page if this was the last one. */
export function nextStepPath(projectId: string, pages: PageId[], currentStepId: SetupStepId): string {
  const steps = getSetupSteps(pages);
  const idx = steps.findIndex((s) => s.id === currentStepId);
  const next = steps[idx + 1];
  return next ? stepPath(projectId, next.id) : `/dashboard/projects/${projectId}`;
}
