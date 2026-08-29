// app/dashboard/projects/[projectId]/edit/nav-footer/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { NAV_DEFAULTS, FOOTER_DEFAULTS, type ContentNav, type ContentFooter, type PageId } from "@/lib/templateEngine";
import { nextStepPath } from "@/lib/setupFlow";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ImageSlotPicker from "@/components/project/ImageSlotPicker";
import SectionLayersNav, { type SectionLayerItem } from "@/components/project/SectionLayersNav";
import ResponsiveDeviceFrame from "@/components/project/ResponsiveDeviceFrame";
import SetupFlowBar from "@/components/project/SetupFlowBar";
import type { Project } from "@/types";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function EditNavFooterPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupFlow = searchParams.get("flow") === "setup";

  const [project, setProject] = useState<Project | null>(null);
  const [nav, setNav] = useState<ContentNav | null>(null);
  const [footer, setFooter] = useState<ContentFooter | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("navbar");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    api
      .getProject(projectId)
      .then((p) => {
        setProject(p);
        setNav(p.content?.nav ?? NAV_DEFAULTS);
        setFooter(p.content?.footer ?? FOOTER_DEFAULTS);
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Failed to load project"));
  }, [projectId]);

  function resetToDefault() {
    if (!confirm("Reset the navbar and footer to their default text? Unsaved changes will be lost.")) return;
    setNav(NAV_DEFAULTS);
    setFooter(FOOTER_DEFAULTS);
  }

  async function handleSave() {
    if (!nav || !footer || !project) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      await api.updatePageContent(projectId, "nav", nav);
      const updated = await api.updatePageContent(projectId, "footer", footer);
      if (isSetupFlow) {
        router.push(nextStepPath(projectId, updated.pages, "nav-footer"));
        return;
      }
      setProject(updated);
      setSaveSuccess("Saved.");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleSkip() {
    if (!project) return;
    router.push(nextStepPath(projectId, project.pages, "nav-footer"));
  }

  function scrollToSection(id: string) {
    setActiveSectionId(id);
    const el = document.getElementById(`section-card-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (loadError) return <p className="p-10 text-sm text-rose-600">{loadError}</p>;
  if (!project || !nav || !footer) return <Spinner />;

  const sectionLayers: SectionLayerItem[] = [
    { id: "navbar", name: "Sticky Navigation Bar", isCustomized: Boolean(nav.logoUrl || nav.ctaText !== NAV_DEFAULTS.ctaText), hasImage: Boolean(nav.logoUrl) },
    { id: "footer", name: "Site Footer & Copyright", isCustomized: Boolean(footer.tagline !== FOOTER_DEFAULTS.tagline) },
  ];

  const previewPage: PageId = project.pages.includes("home") ? "home" : project.pages[0];
  const previewConfig = {
    templateId: project.templateId,
    themeId: project.themeId,
    motionId: project.motionId,
    pages: [previewPage],
    brandName: project.brandName,
    contentOverrides: {
      ...(project.content?.home ? { home: project.content.home } : {}),
      nav,
      footer,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        ← Back to project overview
      </button>

      {isSetupFlow && <SetupFlowBar pages={project.pages} currentStepId="nav-footer" onSkip={handleSkip} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Edit Navbar &amp; Footer</h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
              Shared Across All Pages
            </span>
          </div>
          <p className="text-xs text-slate-500">Project: {project.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && <span className="text-xs font-semibold text-emerald-600">✓ {saveSuccess}</span>}
          <Button variant="ghost" size="sm" type="button" onClick={resetToDefault}>
            Reset to default
          </Button>
          <Button type="button" loading={saving} onClick={handleSave}>
            {isSetupFlow ? "Save & continue" : "Save Changes"}
          </Button>
        </div>
      </div>

      {saveError && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-600">{saveError}</p>}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-6">
          <SectionLayersNav
            sections={sectionLayers}
            activeSectionId={activeSectionId}
            onSelectSection={scrollToSection}
            pageTitle="Chrome"
          />

          {/* Section: Navbar */}
          <div id="section-card-navbar">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "navbar" ? "ring-2 ring-indigo-500" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">01. Sticky Navigation Bar</h2>
                <span className="text-[11px] text-slate-400">Header</span>
              </div>

              <ImageSlotPicker
                label="Custom Brand Logo Mark (Optional)"
                value={nav.logoUrl || ""}
                onChange={(url) => setNav((n) => (n ? { ...n, logoUrl: url } : n))}
                projectId={projectId}
                projectFiles={project.files}
                compact
                aspectRatio="square"
                hint="Upload brand logo icon or mark to replace the default geometric dot"
              />

              <Input
                label="Primary CTA button text (points to Contact)"
                name="ctaText"
                value={nav.ctaText}
                onChange={(e) => setNav((n) => (n ? { ...n, ctaText: e.target.value } : n))}
                placeholder="Get in touch"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Login text (when login enabled)"
                  name="loginText"
                  value={nav.loginText}
                  onChange={(e) => setNav((n) => (n ? { ...n, loginText: e.target.value } : n))}
                  placeholder="Log in"
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Login Display Style</label>
                  <select
                    value={nav.loginStyle || "button"}
                    onChange={(e) => setNav((n) => (n ? { ...n, loginStyle: e.target.value as "button" | "link" } : n))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="button">Ghost Button</option>
                    <option value="link">Inline Nav Link</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Section: Footer */}
          <div id="section-card-footer">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "footer" ? "ring-2 ring-indigo-500" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">02. Site Footer</h2>
                <span className="text-[11px] text-slate-400">Bottom</span>
              </div>

              <Input
                label="Tagline under the brand name"
                name="tagline"
                textarea
                value={footer.tagline}
                onChange={(e) => setFooter((f) => (f ? { ...f, tagline: e.target.value } : f))}
                placeholder="A design experienced before it's built."
              />
              <Input
                label="Bottom note / legal disclaimer"
                name="bottomNote"
                value={footer.bottomNote}
                onChange={(e) => setFooter((f) => (f ? { ...f, bottomNote: e.target.value } : f))}
                placeholder="Prototype generated for client review — not a live website."
              />
            </Card>
          </div>
        </div>

        {/* Right Column: Live Viewport Canvas */}
        <div className="lg:col-span-6">
          <div className="sticky top-6">
            <ResponsiveDeviceFrame
              config={previewConfig}
              title={`Live Preview · Navigation & Chrome`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
