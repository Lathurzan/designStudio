// app/preview/[token]/page.tsx
// PUBLIC page — no login required. The client sees the running website
// (real nav, scroll, animations) with responsive multi-device switchers.
"use client";

import { useEffect, useState, useMemo, use } from "react";
import { api } from "@/lib/api";
import { buildPrototypeDoc, TEMPLATE_META } from "@/lib/templateEngine";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import ApproveActions from "@/components/preview/ApproveActions";
import CommentThread from "@/components/project/CommentThread";
import FileGallery from "@/components/project/FileGallery";
import type { PublicProject } from "@/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function ClientPreviewPage({ params }: PageProps) {
  const { token } = use(params);
  const [project, setProject] = useState<PublicProject | null>(null);
  const [error, setError] = useState("");
  const [clientName, setClientName] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [feedbackSent, setFeedbackSent] = useState("");

  function load() {
    api
      .getPreview(token)
      .then((p) => {
        setProject(p);
        if (p.clientName) setClientName(p.clientName);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "This link is no longer valid."));
  }

  useEffect(load, [token]);

  async function handleAddComment(text: string) {
    const name = clientName.trim() || project?.clientName || "Client";
    const updated = await api.addClientComment(token, { authorName: name, text });
    setProject(updated);
  }

  async function handleApprove() {
    const updated = await api.approveProject(token);
    setProject(updated);
    setFeedbackSent("Thank you! The design has been approved.");
  }

  async function handleRequestChanges() {
    const updated = await api.requestChanges(token);
    setProject(updated);
    setFeedbackSent("Changes requested! Your freelancer has been notified.");
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center text-white">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
          ⚠️
        </div>
        <h1 className="text-xl font-bold">Link Not Found or Revoked</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          This preview link is no longer active. Please contact your designer or freelancer for an updated link.
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner />
      </div>
    );
  }

  const meta = TEMPLATE_META[project.templateId];
  const brand = project.brandName?.trim() || meta.name;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Client Portal Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-sm">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">{project.name}</h1>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-[11px] text-slate-400">Prepared for {project.clientName} · {meta.layoutName}</p>
            </div>
          </div>

          {/* Viewport controls */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewport === "desktop" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewport === "tablet" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Tablet
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewport === "mobile" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Mobile
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-10">
        {feedbackSent && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center text-sm font-semibold text-emerald-400 animate-in fade-in">
            {feedbackSent}
          </div>
        )}

        {/* Live Website Frame */}
        <section>
          <LiveWebsiteFrame config={project} brand={brand} viewport={viewport} />
        </section>

        {/* Action Decision Section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xs">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">Your Design Decision</h2>
            <p className="mt-1 text-xs text-slate-400">
              Approve this design to proceed with final delivery, or request changes with notes below.
            </p>
          </div>

          <ApproveActions
            status={project.status}
            onApprove={handleApprove}
            onRequestChanges={handleRequestChanges}
          />
        </section>

        {/* Reference Assets */}
        {project.files.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs">
            <h2 className="text-sm font-bold text-white mb-1">Attached Reference Files</h2>
            <p className="text-xs text-slate-400 mb-4">Guidelines, logos, and moodboards uploaded by your designer.</p>
            <FileGallery files={project.files} />
          </section>
        )}

        {/* Comments Section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xs">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Notes &amp; Revision Feedback</h2>
            <p className="text-xs text-slate-400">Leave specific questions, change requests, or comments.</p>
          </div>

          <div className="mb-5 max-w-sm">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Camille Reyes"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <CommentThread comments={project.comments} onAddComment={handleAddComment} />
        </section>
      </div>
    </main>
  );
}

function LiveWebsiteFrame({
  config,
  brand,
  viewport,
}: {
  config: PublicProject;
  brand: string;
  viewport: "desktop" | "tablet" | "mobile";
}) {
  const html = useMemo(
    () => buildPrototypeDoc(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.templateId, config.themeId, config.motionId, JSON.stringify(config.pages), JSON.stringify(config.content)]
  );

  function openFullscreen() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  const frameWidthClass = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  }[viewport];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            </div>
            <span className="ml-2 font-mono text-[11px] text-slate-400">live://{brand.toLowerCase().replace(/\s+/g, "")}.preview</span>
          </div>
          <button
            onClick={openFullscreen}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-indigo-500 hover:text-white transition-colors"
          >
            <span>Open Standalone Tab ↗</span>
          </button>
        </div>

        <div className="flex justify-center bg-slate-950 p-4 min-h-[600px]">
          <div className={`transition-all duration-300 overflow-hidden rounded-xl shadow-2xl bg-white ${frameWidthClass}`}>
            <iframe
              srcDoc={html}
              title={`${brand} live preview`}
              style={{ width: "100%", height: "76vh", border: 0, display: "block" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
