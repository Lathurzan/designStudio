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
import ResponsiveDeviceFrame from "@/components/project/ResponsiveDeviceFrame";
import { TEMPLATE_META, type PrototypeConfig } from "@/lib/templateEngine";
import { stepPath } from "@/lib/setupFlow";
import type { Project, ProjectStatus } from "@/types";

const STATUS_OPTIONS: ProjectStatus[] = ["draft", "in_review", "changes_requested", "approved"];

const EDITABLE_PAGE_INFO: { id: "home" | "about" | "services" | "contact"; label: string; icon: string; description: string }[] = [
  { id: "home", label: "Home Page", icon: "🏠", description: "Hero visual, stats counter, client logos, testimonials & CTA" },
  { id: "about", label: "About Page", icon: "📖", description: "Studio story, split hero visual, team principles & values" },
  { id: "services", label: "Services Page", icon: "💼", description: "Service catalogue offerings, deliverables & custom icons/photos" },
  { id: "contact", label: "Contact Page", icon: "✉️", description: "Direct studio details, inquiry form & booking prompt" },
];

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"studio" | "content" | "design" | "files" | "comments">("studio");
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
    if (trimmed === (project.brandName || "")) return;
    try {
      const updated = await api.updateProject(projectId, { brandName: trimmed });
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update brand name");
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
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

  const previewConfig: PrototypeConfig = {
    templateId: project.templateId,
    themeId: project.themeId,
    motionId: project.motionId,
    pages: project.pages,
    brandName: project.brandName,
    sectionTemplates: project.sectionTemplates,
    contentOverrides: {
      home: project.content?.home || undefined,
      about: project.content?.about || undefined,
      services: project.content?.services || undefined,
      contact: project.content?.contact || undefined,
      nav: project.content?.nav || undefined,
      footer: project.content?.footer || undefined,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Top Breadcrumb & Actions */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← Back to projects
        </button>

        <div className="flex items-center gap-2">
          <Link href={stepPath(projectId, "home")}>
            <Button size="sm" variant="ghost">
              ✨ Guided Content Walkthrough
            </Button>
          </Link>
          <a
            href={`/preview/${project.shareToken}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <span>Open Client Portal ↗</span>
          </a>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
              <StatusBadge status={project.status} />
              {savingDesign && <span className="text-xs font-medium text-slate-400 animate-pulse">Saving…</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Client: <span className="font-semibold text-slate-700">{project.clientName}</span>
              {project.clientEmail ? ` · ${project.clientEmail}` : ""}
              {project.description ? ` · ${project.description}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</label>
              <select
                value={project.status}
                onChange={handleStatusChange}
                disabled={savingStatus}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-slate-100">
          {[
            { id: "studio", label: "Interactive Canvas Studio", icon: "🎨" },
            { id: "content", label: "Section-by-Section Copy", icon: "✏️" },
            { id: "design", label: "Design, Palette & Motion", icon: "⚡" },
            { id: "files", label: `Reference Files (${project.files.length})`, icon: "📁" },
            { id: "comments", label: `Client Comments (${project.comments.length})`, icon: "💬" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Studio Live Canvas */}
      {activeTab === "studio" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ResponsiveDeviceFrame
              config={previewConfig}
              title={`${project.name} · Live Website Prototype`}
            />
          </div>

          <div className="space-y-6 lg:col-span-4">
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-bold text-slate-900">Custom Business Name</h2>
              <Input
                name="brandName"
                value={brandNameInput}
                onChange={(e) => setBrandNameInput(e.target.value)}
                onBlur={handleBrandNameBlur}
                placeholder={TEMPLATE_META[project.templateId].name}
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Replaces template default placeholder everywhere across nav, hero, and footer.
              </p>
            </Card>

            <ShareLinkBox shareToken={project.shareToken} onRegenerate={handleRegenerate} />

            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Quick Section Editors</h2>
              <div className="divide-y divide-slate-100">
                {EDITABLE_PAGE_INFO.filter((p) => project.pages.includes(p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      <span className="text-xs font-semibold text-slate-800">{p.label}</span>
                    </div>
                    <Link href={`/dashboard/projects/${projectId}/edit/${p.id}`}>
                      <Button size="sm" variant="ghost">Edit</Button>
                    </Link>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span className="text-xs font-semibold text-slate-800">Navbar &amp; Footer</span>
                  </div>
                  <Link href={`/dashboard/projects/${projectId}/edit/nav-footer`}>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Button variant="danger" size="sm" className="w-full" onClick={handleDelete}>
              Delete Project
            </Button>
          </div>
        </div>
      )}

      {/* Tab 2: Content Editors Grid */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Section-by-Section Content Editors</h2>
              <p className="text-xs text-slate-500">Edit every headline, stat, image, service card, and testimonial</p>
            </div>
            <Link href={stepPath(projectId, "home")}>
              <Button>🚀 Launch Walkthrough Wizard</Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {EDITABLE_PAGE_INFO.filter((p) => project.pages.includes(p.id)).map((p) => {
              const customized = Boolean(project.content?.[p.id]);
              return (
                <Card key={p.id} className="p-5 flex flex-col justify-between hover:border-indigo-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.icon}</span>
                        <h3 className="text-sm font-bold text-slate-900">{p.label}</h3>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          customized
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {customized ? "✓ Customized" : "Template Default"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{p.description}</p>
                  </div>

                  <Link href={`/dashboard/projects/${projectId}/edit/${p.id}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Open {p.label} Editor →
                    </Button>
                  </Link>
                </Card>
              );
            })}

            {/* Nav & Footer Card */}
            <Card className="p-5 flex flex-col justify-between hover:border-indigo-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🌐</span>
                    <h3 className="text-sm font-bold text-slate-900">Navbar &amp; Footer</h3>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                    Shared Chrome
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Brand mark, logo image, CTA buttons, tagline &amp; legal copyright notes</p>
              </div>

              <Link href={`/dashboard/projects/${projectId}/edit/nav-footer`}>
                <Button variant="secondary" size="sm" className="w-full">
                  Open Nav &amp; Footer Editor →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Design & Templates */}
      {activeTab === "design" && (
        <Card className="p-6">
          <TemplatePicker
            value={{
              templateId: project.templateId,
              themeId: project.themeId,
              motionId: project.motionId,
              pages: project.pages,
              sectionTemplates: project.sectionTemplates,
            }}
            onChange={handleDesignChange}
            showPreview={false}
          />
        </Card>
      )}

      {/* Tab 4: Reference Files */}
      {activeTab === "files" && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Reference Assets &amp; Brand Files</h2>
              <p className="text-xs text-slate-500">Attach logos, moodboards, and guidelines shared with the client</p>
            </div>
            <FileUploader
              projectId={projectId}
              onUploaded={(files) => setProject((p) => (p ? { ...p, files } : p))}
            />
          </div>
          <FileGallery files={project.files} emptyHint="No reference files uploaded yet." />
        </Card>
      )}

      {/* Tab 5: Comments */}
      {activeTab === "comments" && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Client Feedback &amp; Freelancer Notes</h2>
            <p className="text-xs text-slate-500">Live threaded discussion visible to you and your client</p>
          </div>
          <CommentThread comments={project.comments} onAddComment={handleAddComment} />
        </Card>
      )}
    </div>
  );
}
