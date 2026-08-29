// app/dashboard/projects/[projectId]/edit/home/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { getDefaultPageContent, type ContentHome } from "@/lib/templateEngine";
import { nextStepPath } from "@/lib/setupFlow";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ImageSlotPicker from "@/components/project/ImageSlotPicker";
import SectionLayersNav, { type SectionLayerItem } from "@/components/project/SectionLayersNav";
import ResponsiveDeviceFrame from "@/components/project/ResponsiveDeviceFrame";
import SetupFlowBar from "@/components/project/SetupFlowBar";
import TitleBodyListEditor from "@/components/project/TitleBodyListEditor";
import type { Project } from "@/types";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function EditHomePage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupFlow = searchParams.get("flow") === "setup";

  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState<ContentHome | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("hero");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    api
      .getProject(projectId)
      .then((p) => {
        setProject(p);
        setContent(p.content?.home ?? getDefaultPageContent(p.templateId, "home"));
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Failed to load project"));
  }, [projectId]);

  function update(patch: Partial<ContentHome>) {
    setContent((c) => (c ? { ...c, ...patch } : c));
  }

  function resetToDefault() {
    if (!project) return;
    if (!confirm("Reset this page to the template's default content? Unsaved changes will be lost.")) return;
    setContent(getDefaultPageContent(project.templateId, "home"));
  }

  async function handleSave() {
    if (!content || !project) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const updated = await api.updatePageContent(projectId, "home", content);
      if (isSetupFlow) {
        router.push(nextStepPath(projectId, updated.pages, "home"));
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
    router.push(nextStepPath(projectId, project.pages, "home"));
  }

  function scrollToSection(id: string) {
    setActiveSectionId(id);
    const el = document.getElementById(`section-card-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ---- stats array helpers ----
  function updateStat(i: number, patch: Partial<{ n: string; l: string }>) {
    if (!content) return;
    update({ stats: content.stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  }
  function removeStat(i: number) {
    if (!content) return;
    update({ stats: content.stats.filter((_, idx) => idx !== i) });
  }
  function addStat() {
    if (!content) return;
    update({ stats: [...content.stats, { n: "", l: "" }] });
  }

  // ---- logos array helpers ----
  function updateLogo(i: number, value: string) {
    if (!content) return;
    update({ logos: content.logos.map((l, idx) => (idx === i ? value : l)) });
  }
  function removeLogo(i: number) {
    if (!content) return;
    update({ logos: content.logos.filter((_, idx) => idx !== i) });
  }
  function addLogo() {
    if (!content) return;
    update({ logos: [...content.logos, ""] });
  }

  // ---- work items helpers ----
  function updateWorkItem(i: number, patch: Partial<{ title: string; meta: string; body: string; image?: string }>) {
    if (!content?.selectedWork) return;
    update({
      selectedWork: {
        ...content.selectedWork,
        items: content.selectedWork.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
      },
    });
  }
  function addWorkItem() {
    if (!content?.selectedWork) return;
    update({
      selectedWork: {
        ...content.selectedWork,
        items: [...content.selectedWork.items, { title: "New Project", meta: "Category · 2026", body: "Description of the work delivered." }],
      },
    });
  }
  function removeWorkItem(i: number) {
    if (!content?.selectedWork) return;
    update({
      selectedWork: {
        ...content.selectedWork,
        items: content.selectedWork.items.filter((_, idx) => idx !== i),
      },
    });
  }

  if (loadError) return <p className="p-10 text-sm text-rose-600">{loadError}</p>;
  if (!project || !content) return <Spinner />;

  const sectionLayers: SectionLayerItem[] = [
    { id: "hero", name: "Hero Banner", isCustomized: Boolean(content.h1), hasImage: Boolean(content.heroImage) },
    { id: "stats", name: "Stats Counter", isCustomized: content.stats.length > 0 },
    { id: "logos", name: "Client Logos Strip", isCustomized: content.logos.length > 0 },
    { id: "services", name: "Services Intro", isCustomized: Boolean(content.servicesHeading) },
    ...(content.process ? [{ id: "process", name: "Process Flow", isCustomized: true }] : []),
    ...(content.selectedWork ? [{ id: "work", name: "Selected Work", isCustomized: true, hasImage: content.selectedWork.items.some((i) => Boolean(i.image)) }] : []),
    { id: "quote", name: "Client Testimonial", isCustomized: Boolean(content.quote), hasImage: Boolean(content.quoteAvatar) },
    { id: "cta", name: "Call to Action Band", isCustomized: Boolean(content.ctaBandTitle) },
  ];

  const previewConfig = {
    templateId: project.templateId,
    themeId: project.themeId,
    motionId: project.motionId,
    pages: ["home" as const],
    brandName: project.brandName,
    contentOverrides: { home: content },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        ← Back to project overview
      </button>

      {isSetupFlow && <SetupFlowBar pages={project.pages} currentStepId="home" onSkip={handleSkip} />}

      {/* Header bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Edit Home Page</h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
              Section Editor
            </span>
          </div>
          <p className="text-xs text-slate-500">Project: {project.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-in fade-in">
              ✓ {saveSuccess}
            </span>
          )}
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
        {/* Left Column: Figma-Style Section Inspector */}
        <div className="space-y-6 lg:col-span-6">
          {/* Visual Layers Navigator */}
          <SectionLayersNav
            sections={sectionLayers}
            activeSectionId={activeSectionId}
            onSelectSection={scrollToSection}
            pageTitle="Home"
          />

          {/* Section: Hero */}
          <div id="section-card-hero">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "hero" ? "ring-2 ring-indigo-500" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">01. Hero Section</h2>
                <span className="text-[11px] font-medium text-slate-400">Headline &amp; Visual Art</span>
              </div>

              <ImageSlotPicker
                label="Hero Visual Asset / Cover Image"
                value={content.heroImage || ""}
                onChange={(url) => update({ heroImage: url })}
                projectId={projectId}
                projectFiles={project.files}
                hint="Click + to add a real mockup photo, architectural hero, or design visual. Leave empty to use geometric artwork."
              />

              <Input
                label="Eyebrow tag"
                name="eyebrow"
                value={content.eyebrow}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="STUDIO / CONSULTING"
              />
              <Input
                label="Headline (H1)"
                name="h1"
                textarea
                value={content.h1}
                onChange={(e) => update({ h1: e.target.value })}
                placeholder="Main impact headline"
              />
              <Input
                label="Subheading lede"
                name="lede"
                textarea
                value={content.lede}
                onChange={(e) => update({ lede: e.target.value })}
                placeholder="Short explanatory paragraph under headline"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Primary Button Text"
                  name="cta1"
                  value={content.cta1}
                  onChange={(e) => update({ cta1: e.target.value })}
                />
                <Input
                  label="Secondary Button Text"
                  name="cta2"
                  value={content.cta2}
                  onChange={(e) => update({ cta2: e.target.value })}
                />
              </div>
            </Card>
          </div>

          {/* Section: Stats */}
          <div id="section-card-stats">
            <Card className={`p-5 transition-all ${activeSectionId === "stats" ? "ring-2 ring-indigo-500" : ""}`}>
              <h2 className="mb-3 text-sm font-bold text-slate-900">02. Stats Counter Section</h2>
              <div className="space-y-2">
                {content.stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={s.n}
                      onChange={(e) => updateStat(i, { n: e.target.value })}
                      placeholder="180+"
                      className="w-24 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      value={s.l}
                      onChange={(e) => updateStat(i, { l: e.target.value })}
                      placeholder="Engagements delivered"
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeStat(i)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addStat}>
                + Add Stat
              </Button>
            </Card>
          </div>

          {/* Section: Client Logos */}
          <div id="section-card-logos">
            <Card className={`p-5 transition-all ${activeSectionId === "logos" ? "ring-2 ring-indigo-500" : ""}`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">03. Client Logos &amp; Marquee</h2>
                <span className="text-[11px] text-slate-400">Text names or Image URLs</span>
              </div>
              <div className="space-y-2">
                {content.logos.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={l}
                      onChange={(e) => updateLogo(i, e.target.value)}
                      placeholder="Brand Name or Image URL (https://...)"
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeLogo(i)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addLogo}>
                + Add Logo
              </Button>
            </Card>
          </div>

          {/* Section: Services Intro */}
          <div id="section-card-services">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "services" ? "ring-2 ring-indigo-500" : ""}`}>
              <h2 className="text-sm font-bold text-slate-900">04. Services Heading on Home</h2>
              <Input
                label="Section Heading"
                name="servicesHeading"
                value={content.servicesHeading}
                onChange={(e) => update({ servicesHeading: e.target.value })}
                placeholder="Three ways we help"
              />
            </Card>
          </div>

          {/* Section: Process Flow (if supported) */}
          {content.process && (
            <div id="section-card-process">
              <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "process" ? "ring-2 ring-indigo-500" : ""}`}>
                <h2 className="text-sm font-bold text-slate-900">05. Process Timeline Section</h2>
                <Input
                  label="Section Heading"
                  name="processHeading"
                  value={content.process.heading}
                  onChange={(e) => update({ process: { ...content.process!, heading: e.target.value } })}
                />
                <TitleBodyListEditor
                  items={content.process.steps}
                  itemLabel="step"
                  onChange={(steps) => update({ process: { ...content.process!, steps } })}
                />
              </Card>
            </div>
          )}

          {/* Section: Selected Work / Portfolio (if supported) */}
          {content.selectedWork && (
            <div id="section-card-work">
              <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "work" ? "ring-2 ring-indigo-500" : ""}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">06. Selected Work Showcase</h2>
                  <Button type="button" variant="ghost" size="sm" onClick={addWorkItem}>
                    + Add Project
                  </Button>
                </div>
                <Input
                  label="Section Heading"
                  name="selectedWorkHeading"
                  value={content.selectedWork.heading}
                  onChange={(e) => update({ selectedWork: { ...content.selectedWork!, heading: e.target.value } })}
                />
                <div className="space-y-4">
                  {content.selectedWork.items.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600">Project #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeWorkItem(idx)}
                          className="text-xs text-slate-400 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                      <ImageSlotPicker
                        label="Project Showcase Image (Optional)"
                        value={item.image || ""}
                        onChange={(url) => updateWorkItem(idx, { image: url })}
                        projectId={projectId}
                        projectFiles={project.files}
                        compact
                        aspectRatio="wide"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Title"
                          name={`work-title-${idx}`}
                          value={item.title}
                          onChange={(e) => updateWorkItem(idx, { title: e.target.value })}
                        />
                        <Input
                          label="Meta tag"
                          name={`work-meta-${idx}`}
                          value={item.meta}
                          onChange={(e) => updateWorkItem(idx, { meta: e.target.value })}
                        />
                      </div>
                      <Input
                        label="Description"
                        name={`work-body-${idx}`}
                        textarea
                        value={item.body}
                        onChange={(e) => updateWorkItem(idx, { body: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Section: Testimonials */}
          <div id="section-card-quote">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "quote" ? "ring-2 ring-indigo-500" : ""}`}>
              <h2 className="text-sm font-bold text-slate-900">07. Client Testimonial Quote</h2>
              <ImageSlotPicker
                label="Client Avatar Photo"
                value={content.quoteAvatar || ""}
                onChange={(url) => update({ quoteAvatar: url })}
                projectId={projectId}
                projectFiles={project.files}
                aspectRatio="circle"
                compact
                hint="Add client headshot or avatar"
              />
              <Input label="Quote Text" name="quote" textarea value={content.quote} onChange={(e) => update({ quote: e.target.value })} />
              <Input
                label="Client Name &amp; Title"
                name="quoteBy"
                value={content.quoteBy}
                onChange={(e) => update({ quoteBy: e.target.value })}
                placeholder="Priya Nandakumar, COO at Portage Group"
              />
            </Card>
          </div>

          {/* Section: CTA Band */}
          <div id="section-card-cta">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "cta" ? "ring-2 ring-indigo-500" : ""}`}>
              <h2 className="text-sm font-bold text-slate-900">08. Call-to-Action Band</h2>
              <Input
                label="Title"
                name="ctaBandTitle"
                value={content.ctaBandTitle}
                onChange={(e) => update({ ctaBandTitle: e.target.value })}
              />
              <Input
                label="Body Text"
                name="ctaBandBody"
                textarea
                value={content.ctaBandBody}
                onChange={(e) => update({ ctaBandBody: e.target.value })}
              />
            </Card>
          </div>
        </div>

        {/* Right Column: Live Viewport Canvas (sticky) */}
        <div className="lg:col-span-6">
          <div className="sticky top-6">
            <ResponsiveDeviceFrame
              config={previewConfig}
              title={`Live Preview · ${project.name}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
