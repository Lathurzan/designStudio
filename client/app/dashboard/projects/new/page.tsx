// app/dashboard/projects/new/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  PAGE_ORDER,
  PAGE_LABELS,
  TEMPLATE_META,
  THEMES,
  MOTION,
  type TemplateId,
  type ThemeId,
  type MotionId,
  type PageId,
  type SectionKey,
  type PrototypeConfig,
} from "@/lib/templateEngine";
import { getSetupSteps, stepPath } from "@/lib/setupFlow";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ScaledFrame from "@/components/project/ScaledFrame";
import ResponsiveDeviceFrame from "@/components/project/ResponsiveDeviceFrame";
import type { Project } from "@/types";

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[];
const THEME_IDS = Object.keys(THEMES) as ThemeId[];
const MOTION_IDS = Object.keys(MOTION) as MotionId[];

const SECTION_ROWS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "chrome", label: "Navbar & Footer", icon: "🌐" },
  { key: "home", label: "Home Page", icon: "🏠" },
  { key: "about", label: "About Page", icon: "📖" },
  { key: "services", label: "Services Page", icon: "💼" },
  { key: "contact", label: "Contact Page", icon: "✉️" },
  { key: "login", label: "Login Page", icon: "🔐" },
];

interface BasicsForm {
  name: string;
  clientName: string;
  clientEmail: string;
  description: string;
  brandName: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [basics, setBasics] = useState<BasicsForm>({
    name: "",
    clientName: "",
    clientEmail: "",
    description: "",
    brandName: "",
  });
  const [config, setConfig] = useState<PrototypeConfig>({
    templateId: "modern",
    themeId: "blue",
    motionId: "smooth",
    pages: [...PAGE_ORDER],
  });
  const [loginStyle, setLoginStyle] = useState<"button" | "link">("button");
  const [showOneByOne, setShowOneByOne] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);

  function updateBasics(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setBasics({ ...basics, [e.target.name]: e.target.value });
  }

  function updateConfig(patch: Partial<PrototypeConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
  }

  function togglePage(page: PageId) {
    if (page === "home") return; // always required
    const has = config.pages.includes(page);
    const next = has
      ? config.pages.filter((p) => p !== page)
      : PAGE_ORDER.filter((p) => [...config.pages, page].includes(p));
    updateConfig({ pages: next });
  }

  function updateSectionTemplate(section: SectionKey, templateId: TemplateId | "") {
    const next = { ...(config.sectionTemplates || {}) };
    if (templateId === "") {
      delete next[section];
    } else {
      next[section] = templateId;
    }
    updateConfig({ sectionTemplates: next });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const project = await api.createProject({
        name: basics.name.trim(),
        clientName: basics.clientName.trim(),
        clientEmail: basics.clientEmail.trim() || undefined,
        description: basics.description.trim() || undefined,
        templateId: config.templateId,
        themeId: config.themeId,
        motionId: config.motionId,
        pages: config.pages,
      });

      // Update brandName, sectionTemplates, and loginStyle if configured
      const patchPayload: Record<string, unknown> = {};
      if (basics.brandName.trim()) {
        patchPayload.brandName = basics.brandName.trim();
      }
      if (config.sectionTemplates && Object.keys(config.sectionTemplates).length > 0) {
        patchPayload.sectionTemplates = config.sectionTemplates;
      }
      if (Object.keys(patchPayload).length > 0) {
        await api.updateProject(project._id, patchPayload);
      }

      // If login style is customized, save to nav content
      if (loginStyle === "link") {
        await api.updatePageContent(project._id, "nav", { ctaText: "Get in touch", loginText: "Log in", loginStyle: "link" });
      }

      // Upload reference files if selected
      if (files && files.length > 0) {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));
        await api.uploadFiles(project._id, formData);
      }

      setCreatedProject(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  // Success view with clear choices
  if (createdProject) {
    const firstStep = getSetupSteps(createdProject.pages)[0];
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs ring-1 ring-emerald-100">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          Project Ready
        </span>
        <h1 className="mt-3 mb-2 text-2xl font-bold tracking-tight text-slate-900">
          &ldquo;{createdProject.name}&rdquo; Created Successfully
        </h1>
        <p className="mb-8 text-sm text-slate-500 max-w-md mx-auto">
          Would you like to customize the copy &amp; images section-by-section now with the guided wizard, or open the Studio overview?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push(stepPath(createdProject._id, firstStep.id))}>
            🚀 Start Section Walkthrough
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/dashboard/projects/${createdProject._id}`)}>
            Open Studio Hub
          </Button>
        </div>
      </div>
    );
  }

  const liveConfig: PrototypeConfig = {
    ...config,
    brandName: basics.brandName.trim() || basics.name.trim() || undefined,
    contentOverrides: {
      nav: {
        ctaText: "Get in touch",
        loginText: "Log in",
        loginStyle,
      },
    },
  };

  const visibleSectionRows = SECTION_ROWS.filter(
    (row) => row.key === "chrome" || config.pages.includes(row.key as PageId)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Top Header */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Back to projects
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Project</h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
              Interactive Setup
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure client details and design template with real-time live canvas preview.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Form & Config Sections */}
          <div className="space-y-6 lg:col-span-6">
            {/* Section 01: Client Details */}
            <Card className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">01. Client &amp; Project Info</h2>
                <span className="text-[11px] font-semibold text-indigo-600">Required</span>
              </div>

              <Input
                label="Project name"
                name="name"
                required
                value={basics.name}
                onChange={updateBasics}
                placeholder="e.g. Meridian Studio — Website Redesign"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Client name"
                  name="clientName"
                  required
                  value={basics.clientName}
                  onChange={updateBasics}
                  placeholder="Camille Reyes"
                />
                <Input
                  label="Client email (optional)"
                  name="clientEmail"
                  type="email"
                  value={basics.clientEmail}
                  onChange={updateBasics}
                  placeholder="camille@client.com"
                />
              </div>

              <Input
                label="Brand name shown on site (optional)"
                name="brandName"
                value={basics.brandName}
                onChange={updateBasics}
                placeholder={TEMPLATE_META[config.templateId].name}
              />

              <Input
                label="Project description (optional)"
                name="description"
                textarea
                value={basics.description}
                onChange={updateBasics}
                placeholder="A short note about the client's goals or scope…"
              />
            </Card>

            {/* Section 02: Starting Template */}
            <Card className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">02. Starting Template</h2>
                <span className="text-[11px] text-slate-400">3 Curated Aesthetics</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {TEMPLATE_IDS.map((tid) => {
                  const meta = TEMPLATE_META[tid];
                  const selected = config.templateId === tid;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => updateConfig({ templateId: tid, themeId: meta.defaultTheme })}
                      className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                        selected
                          ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {selected && (
                        <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                      <div className="overflow-hidden bg-slate-100">
                        <ScaledFrame
                          config={{ templateId: tid, themeId: meta.defaultTheme, motionId: "smooth", pages: ["home"] }}
                          cropHeight={90}
                        />
                      </div>
                      <div className="p-2.5 bg-white border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{meta.layoutName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{meta.category}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Section 03: Colour Palette & Motion */}
            <Card className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">03. Colour Palette &amp; Motion</h2>
                <span className="text-[11px] text-slate-400">Global Tokens</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Palette</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {THEME_IDS.map((thid) => {
                    const t = THEMES[thid];
                    const selected = config.themeId === thid;
                    return (
                      <button
                        key={thid}
                        type="button"
                        onClick={() => updateConfig({ themeId: thid })}
                        title={t.vibe}
                        className={`flex flex-col items-center rounded-xl border-2 p-2 text-center transition-all ${
                          selected
                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full border border-black/10 shadow-xs mb-1" style={{ backgroundColor: t.primary }} />
                        <span className="text-[11px] font-bold text-slate-800">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Motion Physics</label>
                <div className="grid grid-cols-3 gap-2">
                  {MOTION_IDS.map((mid) => {
                    const m = MOTION[mid];
                    const selected = config.motionId === mid;
                    return (
                      <button
                        key={mid}
                        type="button"
                        onClick={() => updateConfig({ motionId: mid })}
                        className={`rounded-xl border-2 p-2.5 text-left transition-all ${
                          selected
                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">{m.label}</p>
                        <p className="text-[10px] text-slate-500 truncate">{m.copy}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Section 04: Included Pages & Login Settings */}
            <Card className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">04. Included Pages &amp; Login Style</h2>
                <span className="text-[11px] text-slate-400">Navigation</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Website Pages</label>
                <div className="flex flex-wrap gap-2">
                  {PAGE_ORDER.map((p) => {
                    const on = config.pages.includes(p);
                    const locked = p === "home";
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={locked}
                        onClick={() => togglePage(p)}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          on
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                            : "border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
                        } ${locked ? "cursor-not-allowed opacity-75" : ""}`}
                      >
                        {on && <span>✓</span>}
                        {PAGE_LABELS[p]}
                        {locked && <span className="text-[10px] opacity-80">(Required)</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {config.pages.filter((p) => p !== "login").length <= 1
                    ? "Single-page mode: 'Home' link is omitted from the navbar automatically to keep it clean."
                    : "Multi-page mode: Navigation links will be displayed in the header."}
                </p>
              </div>

              {config.pages.includes("login") && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Login Action Appearance
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Choose how the Login action appears in the top navigation:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginStyle("button")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all ${
                        loginStyle === "button"
                          ? "border-indigo-600 bg-white text-indigo-600 shadow-xs"
                          : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      <span>Ghost Button</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginStyle("link")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all ${
                        loginStyle === "link"
                          ? "border-indigo-600 bg-white text-indigo-600 shadow-xs"
                          : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      <span>Inline Nav Link</span>
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* Section 05: One-by-One Flexibility (Optional) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">05. Design Flexibility Mode</h3>
                  <p className="text-xs text-slate-500">
                    {showOneByOne
                      ? "Mix and match templates section by section."
                      : "Common mode: Whole site uses the starting template."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOneByOne((v) => !v)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                    showOneByOne
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                      : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
                  }`}
                >
                  {showOneByOne ? "One by one (Active)" : "✨ Enable One by One"}
                </button>
              </div>

              {showOneByOne && (
                <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                  {visibleSectionRows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span>{row.icon}</span>
                        <span className="text-xs font-semibold text-slate-800">{row.label}</span>
                      </div>
                      <select
                        value={config.sectionTemplates?.[row.key] ?? ""}
                        onChange={(e) => updateSectionTemplate(row.key, e.target.value as TemplateId | "")}
                        className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">Default ({TEMPLATE_META[config.templateId].layoutName})</option>
                        {TEMPLATE_IDS.map((tid) => (
                          <option key={tid} value={tid}>
                            {TEMPLATE_META[tid].layoutName}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 06: Reference Assets */}
            <Card className="space-y-3 p-5">
              <h2 className="text-sm font-bold text-slate-900">06. Attach Reference Files (Optional)</h2>
              <p className="text-xs text-slate-500">
                Upload brand guide, logo files, or moodboards to share with this project.
              </p>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => setFiles(e.target.files)}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
              />
            </Card>

            {error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600">{error}</p>}

            {/* Submit Bar */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={loading}>
                Create Project &amp; Proceed →
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Right Column: Live Viewport Canvas (Sticky) */}
          <div className="lg:col-span-6">
            <div className="sticky top-6">
              <ResponsiveDeviceFrame
                config={liveConfig}
                title={`${basics.name.trim() || "New Project Preview"} · Live Preview`}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
