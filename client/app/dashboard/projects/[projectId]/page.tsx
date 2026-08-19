// app/dashboard/projects/[projectId]/page.tsx
"use client";

import { useEffect, useState, use, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import FileUploader from "@/components/project/FileUploader";
import FileGallery from "@/components/project/FileGallery";
import ShareLinkBox from "@/components/project/ShareLinkBox";
import CommentThread from "@/components/project/CommentThread";
import TemplatePicker from "@/components/project/TemplatePicker";
import { TEMPLATE_META, type PrototypeConfig } from "@/lib/templateEngine";
import type { Project, ProjectStatus } from "@/types";

const STATUS_OPTIONS: ProjectStatus[] = ["draft", "in_review", "changes_requested", "approved"];

// Which pages have a real content editor built. Services/Contact use the same
// backend endpoint already — only the editor UI is missing, so this list is
// the one place to update once those pages get built.
const EDITABLE_PAGE_INFO: { id: "home" | "about" | "services" | "contact"; label: string; available: boolean }[] = [
  { id: "home", label: "Home", available: true },
  { id: "about", label: "About", available: true },
  { id: "services", label: "Services", available: false },
  { id: "contact", label: "Contact", available: false },
];

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [brandNameInput, setBrandNameInput] = useState("");

  function load() {
    api
      .getProject(projectId)
      .then((p) => {
        setProject(p);
        setBrandNameInput(p.brandName || "");
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load project"));
  }

  useEffect(load, [projectId]);

  async function handleStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as ProjectStatus;
    setSavingStatus(true);
    try {
      const updated = await api.updateProject(projectId, { status });
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleDesignChange(config: PrototypeConfig) {
    if (!project) return;
    // reflect the change immediately so the picker feels instant, then persist
    setProject({ ...project, ...config });
    setSavingDesign(true);
    try {
      const updated = await api.updateProject(projectId, config);
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save design changes");
    } finally {
      setSavingDesign(false);
    }
  }

  async function handleBrandNameBlur() {
    if (!project) return;
    const trimmed = brandNameInput.trim();
    if (trimmed === (project.brandName || "")) return; // unchanged — skip the round trip
    try {
      const updated = await api.updateProject(projectId, { brandName: trimmed });
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update brand name");
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (!confirm(`Delete "${project.name}"? This can't be undone.`)) return;
    await api.deleteProject(projectId);
    router.push("/dashboard/projects");
  }

  async function handleRegenerate() {
    const updated = await api.regenerateLink(projectId);
    setProject(updated);
  }

  async function handleAddComment(text: string) {
    const updated = await api.addFreelancerComment(projectId, text);
    setProject(updated);
  }

  if (error) {
    return <p className="p-10 text-sm text-rose-600">{error}</p>;
  }
  if (!project) {
    return <Spinner />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={() => router.push("/dashboard/projects")}
        className="mb-4 text-sm text-slate-400 hover:text-slate-700"
      >
        ← Back to projects
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500">
            {project.clientName}
            {project.clientEmail ? ` · ${project.clientEmail}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savingDesign && <span className="text-xs text-slate-400">Saving…</span>}
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-6 sm:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Design</h2>
            <div className="mb-6">
              <Input
                label="Business name shown on the site"
                name="brandName"
                value={brandNameInput}
                onChange={(e) => setBrandNameInput(e.target.value)}
                onBlur={handleBrandNameBlur}
                placeholder={TEMPLATE_META[project.templateId].name}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Leave blank to use the template's default name ({TEMPLATE_META[project.templateId].name}).
              </p>
            </div>
            <TemplatePicker
              value={{
                templateId: project.templateId,
                themeId: project.themeId,
                motionId: project.motionId,
                pages: project.pages,
              }}
              onChange={handleDesignChange}
            />
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-800">Page content</h2>
            <p className="mb-3 text-xs text-slate-400">
              Edit the actual wording on each page — headlines, services, testimonials, and more.
            </p>
            <div className="divide-y divide-slate-100">
              {EDITABLE_PAGE_INFO.filter((p) => project.pages.includes(p.id)).map((p) => {
                const customized = Boolean(project.content?.[p.id]);
                return (
                  <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.label}</p>
                      <p className="text-xs text-slate-400">
                        {p.available ? (customized ? "Customized" : "Using template default") : "Editor coming soon"}
                      </p>
                    </div>
                    {p.available ? (
                      <Link href={`/dashboard/projects/${projectId}/edit/${p.id}`}>
                        <Button size="sm" variant="ghost" type="button">
                          Edit
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="ghost" type="button" disabled>
                        Edit
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Reference files</h2>
              <FileUploader
                projectId={projectId}
                onUploaded={(files) => setProject((p) => (p ? { ...p, files } : p))}
              />
            </div>
            <FileGallery files={project.files} emptyHint="No reference files uploaded." />
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Comments</h2>
            <CommentThread comments={project.comments} onAddComment={handleAddComment} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              value={project.status}
              onChange={handleStatusChange}
              disabled={savingStatus}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </Card>

          <ShareLinkBox shareToken={project.shareToken} onRegenerate={handleRegenerate} />

          <Button variant="danger" size="sm" className="w-full" onClick={handleDelete}>
            Delete project
          </Button>
        </div>
      </div>
    </div>
  );
}
