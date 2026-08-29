// app/dashboard/projects/[projectId]/edit/services/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { getDefaultPageContent, type ContentServices } from "@/lib/templateEngine";
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

export default function EditServicesPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupFlow = searchParams.get("flow") === "setup";

  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState<ContentServices | null>(null);
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
        setContent(p.content?.services ?? getDefaultPageContent(p.templateId, "services"));
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Failed to load project"));
  }, [projectId]);

  function update(patch: Partial<ContentServices>) {
    setContent((c) => (c ? { ...c, ...patch } : c));
  }

  function resetToDefault() {
    if (!project) return;
    if (!confirm("Reset this page to the template's default content? Unsaved changes will be lost.")) return;
    setContent(getDefaultPageContent(project.templateId, "services"));
  }

  async function handleSave() {
    if (!content || !project) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const updated = await api.updatePageContent(projectId, "services", content);
      if (isSetupFlow) {
        router.push(nextStepPath(projectId, updated.pages, "services"));
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
    router.push(nextStepPath(projectId, project.pages, "services"));
  }

  function scrollToSection(id: string) {
    setActiveSectionId(id);
    const el = document.getElementById(`section-card-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function updateServiceItem(i: number, patch: Partial<{ title: string; body: string; image?: string; icon?: string }>) {
    if (!content) return;
    update({
      items: content.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  }

  function addServiceItem() {
    if (!content) return;
    update({
      items: [...content.items, { title: "New Service Offering", body: "Comprehensive solution designed for client success." }],
    });
  }

  function removeServiceItem(i: number) {
    if (!content) return;
    update({
      items: content.items.filter((_, idx) => idx !== i),
    });
  }

  if (loadError) return <p className="p-10 text-sm text-rose-600">{loadError}</p>;
  if (!project || !content) return <Spinner />;

  const sectionLayers: SectionLayerItem[] = [
    { id: "hero", name: "Services Intro & Header", isCustomized: Boolean(content.h1), hasImage: Boolean(content.heroImage) },
    { id: "grid", name: "Services Catalogue Grid", isCustomized: content.items.length > 0, hasImage: content.items.some((it) => Boolean(it.image)) },
    { id: "cta", name: "Services CTA Band", isCustomized: Boolean(content.ctaTitle) },
  ];

  const previewConfig = {
    templateId: project.templateId,
    themeId: project.themeId,
    motionId: project.motionId,
    pages: ["services" as const],
    brandName: project.brandName,
    contentOverrides: { services: content },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        ← Back to project overview
      </button>

      {isSetupFlow && <SetupFlowBar pages={project.pages} currentStepId="services" onSkip={handleSkip} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Edit Services Page</h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
              Section Editor
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
            pageTitle="Services"
          />

          {/* Section: Hero */}
          <div id="section-card-hero">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "hero" ? "ring-2 ring-indigo-500" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">01. Services Headline &amp; Cover</h2>
                <span className="text-[11px] text-slate-400">Title &amp; Intro</span>
              </div>

              <ImageSlotPicker
                label="Services Cover Visual (Optional)"
                value={content.heroImage || ""}
                onChange={(url) => update({ heroImage: url })}
                projectId={projectId}
                projectFiles={project.files}
                hint="Add visual mockup, service banner, or photo illustration."
              />

              <Input
                label="Headline (H1)"
                name="h1"
                textarea
                value={content.h1}
                onChange={(e) => update({ h1: e.target.value })}
                placeholder="Practical help, not theory."
              />
              <Input
                label="Intro / Overview Subheading"
                name="lede"
                textarea
                value={content.lede}
                onChange={(e) => update({ lede: e.target.value })}
                placeholder="Every engagement starts with the same question: ..."
              />
            </Card>
          </div>

          {/* Section: Services Grid */}
          <div id="section-card-grid">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "grid" ? "ring-2 ring-indigo-500" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">02. Services Catalogue Offerings</h2>
                <Button type="button" variant="ghost" size="sm" onClick={addServiceItem}>
                  + Add Service
                </Button>
              </div>

              <div className="space-y-4">
                {content.items.map((it, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">Offering #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeServiceItem(idx)}
                        className="text-xs text-slate-400 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                    <ImageSlotPicker
                      label="Service Card Visual / Photo (Optional)"
                      value={it.image || ""}
                      onChange={(url) => updateServiceItem(idx, { image: url })}
                      projectId={projectId}
                      projectFiles={project.files}
                      compact
                    />
                    <Input
                      label="Service Title"
                      name={`service-title-${idx}`}
                      value={it.title}
                      onChange={(e) => updateServiceItem(idx, { title: e.target.value })}
                    />
                    <Input
                      label="Service Description"
                      name={`service-body-${idx}`}
                      textarea
                      value={it.body}
                      onChange={(e) => updateServiceItem(idx, { body: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Section: CTA */}
          <div id="section-card-cta">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "cta" ? "ring-2 ring-indigo-500" : ""}`}>
              <h2 className="text-sm font-bold text-slate-900">03. Services Call to Action</h2>
              <Input
                label="CTA Title"
                name="ctaTitle"
                value={content.ctaTitle}
                onChange={(e) => update({ ctaTitle: e.target.value })}
              />
              <Input
                label="CTA Body"
                name="ctaBody"
                textarea
                value={content.ctaBody}
                onChange={(e) => update({ ctaBody: e.target.value })}
              />
            </Card>
          </div>
        </div>

        {/* Right Column: Live Viewport Canvas */}
        <div className="lg:col-span-6">
          <div className="sticky top-6">
            <ResponsiveDeviceFrame
              config={previewConfig}
              title={`Live Preview · Services Page`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
