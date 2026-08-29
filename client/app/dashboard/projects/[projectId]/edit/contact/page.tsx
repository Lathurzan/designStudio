// app/dashboard/projects/[projectId]/edit/contact/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { getDefaultPageContent, type ContentContact } from "@/lib/templateEngine";
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

export default function EditContactPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupFlow = searchParams.get("flow") === "setup";

  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState<ContentContact | null>(null);
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
        setContent(p.content?.contact ?? getDefaultPageContent(p.templateId, "contact"));
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Failed to load project"));
  }, [projectId]);

  function update(patch: Partial<ContentContact>) {
    setContent((c) => (c ? { ...c, ...patch } : c));
  }

  function resetToDefault() {
    if (!project) return;
    if (!confirm("Reset this page to the template's default content? Unsaved changes will be lost.")) return;
    setContent(getDefaultPageContent(project.templateId, "contact"));
  }

  async function handleSave() {
    if (!content || !project) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const updated = await api.updatePageContent(projectId, "contact", content);
      if (isSetupFlow) {
        router.push(nextStepPath(projectId, updated.pages, "contact"));
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
    router.push(nextStepPath(projectId, project.pages, "contact"));
  }

  function scrollToSection(id: string) {
    setActiveSectionId(id);
    const el = document.getElementById(`section-card-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (loadError) return <p className="p-10 text-sm text-rose-600">{loadError}</p>;
  if (!project || !content) return <Spinner />;

  const sectionLayers: SectionLayerItem[] = [
    { id: "hero", name: "Contact Headline & Intro", isCustomized: Boolean(content.h1), hasImage: Boolean(content.heroImage) },
    { id: "info", name: "Direct Contact Information", isCustomized: Boolean(content.email || content.phone || content.officeAddress) },
    { id: "form", name: "Inquiry Message Form", isCustomized: true },
  ];

  const previewConfig = {
    templateId: project.templateId,
    themeId: project.themeId,
    motionId: project.motionId,
    pages: ["contact" as const],
    brandName: project.brandName,
    contentOverrides: { contact: content },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        ← Back to project overview
      </button>

      {isSetupFlow && <SetupFlowBar pages={project.pages} currentStepId="contact" onSkip={handleSkip} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Edit Contact Page</h1>
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
            pageTitle="Contact"
          />

          {/* Section: Hero */}
          <div id="section-card-hero">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "hero" ? "ring-2 ring-indigo-500" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">01. Contact Headline &amp; Intro</h2>
                <span className="text-[11px] text-slate-400">Header</span>
              </div>

              <Input
                label="Headline (H1)"
                name="h1"
                textarea
                value={content.h1}
                onChange={(e) => update({ h1: e.target.value })}
                placeholder="Get in touch / Tell us where it hurts."
              />
              <Input
                label="Subheading Intro"
                name="lede"
                textarea
                value={content.lede}
                onChange={(e) => update({ lede: e.target.value })}
                placeholder="Fifteen minutes with a senior partner, no sales pitch..."
              />
            </Card>
          </div>

          {/* Section: Direct Contact Info */}
          <div id="section-card-info">
            <Card className={`space-y-4 p-5 transition-all ${activeSectionId === "info" ? "ring-2 ring-indigo-500" : ""}`}>
              <h2 className="text-sm font-bold text-slate-900">02. Direct Contact Details</h2>
              <p className="text-xs text-slate-400">Shown in the sidebar alongside the inquiry form</p>

              <Input
                label="Contact Email"
                name="email"
                type="email"
                value={content.email || ""}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="hello@studio.com"
              />
              <Input
                label="Phone / WhatsApp (Optional)"
                name="phone"
                value={content.phone || ""}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="+1 (555) 234-5678"
              />
              <Input
                label="Studio / Office Address (Optional)"
                name="officeAddress"
                value={content.officeAddress || ""}
                onChange={(e) => update({ officeAddress: e.target.value })}
                placeholder="740 Broadway, 4th Floor, New York, NY"
              />
            </Card>
          </div>

          {/* Section: Form */}
          <div id="section-card-form">
            <Card className={`space-y-3 p-5 transition-all ${activeSectionId === "form" ? "ring-2 ring-indigo-500" : ""}`}>
              <h2 className="text-sm font-bold text-slate-900">03. Interactive Inquiry Form</h2>
              <p className="text-xs text-slate-500">
                The prototype renders an interactive contact form where clients can test typing and submitting test messages. Submissions animate with a verified confirmation checkmark.
              </p>
            </Card>
          </div>
        </div>

        {/* Right Column: Live Viewport Canvas */}
        <div className="lg:col-span-6">
          <div className="sticky top-6">
            <ResponsiveDeviceFrame
              config={previewConfig}
              title={`Live Preview · Contact Page`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
