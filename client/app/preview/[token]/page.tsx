// app/preview/[token]/page.tsx
// PUBLIC page — no login. This is the big payoff: the client sees the actual
// running website (real nav, real scroll, real animations) inside an iframe
// built from the exact same engine the freelancer used to pick it — not a
// screenshot, not a static gallery. Data here is already trimmed server-side
// (see server's previewController) so this page never has access to
// freelancer account data or any other project.
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

  function load() {
    api
      .getPreview(token)
      .then(setProject)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "This link isn't valid"));
  }

  useEffect(load, [token]);

  async function handleAddComment(text: string) {
    const name = clientName.trim() || "Client";
    const updated = await api.addClientComment(token, { authorName: name, text });
    setProject(updated);
  }

  async function handleApprove() {
    const updated = await api.approveProject(token);
    setProject(updated);
  }

  async function handleRequestChanges() {
    const updated = await api.requestChanges(token);
    setProject(updated);
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="text-sm text-slate-500">
          This link isn't valid anymore. Ask your freelancer for a new one.
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  const meta = TEMPLATE_META[project.templateId];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Design review
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Prepared for {project.clientName} · {meta.layoutName}
          </p>
          <div className="mt-4 flex justify-center">
            <StatusBadge status={project.status} />
          </div>
        </div>

        <section className="mb-10">
          <LiveWebsiteFrame config={project} brand={meta.name} />
        </section>

        <section className="mb-10">
          <ApproveActions
            status={project.status}
            onApprove={handleApprove}
            onRequestChanges={handleRequestChanges}
          />
        </section>

        {project.files.length > 0 && (
          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-1 text-sm font-semibold text-slate-800">Reference files</h2>
            <p className="mb-4 text-xs text-slate-400">Extra material shared alongside the design.</p>
            <FileGallery files={project.files} />
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">Notes &amp; feedback</h2>
          <p className="mb-4 text-xs text-slate-400">
            Leave a comment if something needs to change, or just to say what you love.
          </p>

          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Your name (shown with your comment)"
            className="mb-4 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />

          <CommentThread comments={project.comments} onAddComment={handleAddComment} />
        </section>
      </div>
    </main>
  );
}

/**
 * The live, scrollable website itself — a "browser chrome" bar for polish,
 * a full-height iframe the client can actually scroll and click around in,
 * and an "open full screen" escape hatch (renders the exact same HTML as a
 * real standalone page in a new tab via a Blob URL).
 */
function LiveWebsiteFrame({ config, brand }: { config: PublicProject; brand: string }) {
  const html = useMemo(
    () => buildPrototypeDoc(config),
    // pages is an array — compare by content, not reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.templateId, config.themeId, config.motionId, config.pages.join(",")]
  );

  function openFullscreen() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-3 text-xs font-medium text-slate-400">{brand}</span>
        </div>
        <button
          onClick={openFullscreen}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
        >
          Open full screen ↗
        </button>
      </div>
      <iframe
        srcDoc={html}
        title={`${brand} live preview`}
        style={{ width: "100%", height: "70vh", border: 0, display: "block" }}
      />
    </div>
  );
}
