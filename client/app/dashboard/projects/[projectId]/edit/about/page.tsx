// app/dashboard/projects/[projectId]/edit/about/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getDefaultPageContent, type ContentAbout } from "@/lib/templateEngine";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ScaledFrame from "@/components/project/ScaledFrame";
import TitleBodyListEditor from "@/components/project/TitleBodyListEditor";
import type { Project } from "@/types";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function EditAboutPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState<ContentAbout | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    api
      .getProject(projectId)
      .then((p) => {
        setProject(p);
        setContent(p.content?.about ?? getDefaultPageContent(p.templateId, "about"));
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Failed to load project"));
  }, [projectId]);

  function update(patch: Partial<ContentAbout>) {
    setContent((c) => (c ? { ...c, ...patch } : c));
  }

  function resetToDefault() {
    if (!project) return;
    if (!confirm("Reset this page to the template's default content? Unsaved changes will be lost.")) return;
    setContent(getDefaultPageContent(project.templateId, "about"));
  }

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const updated = await api.updatePageContent(projectId, "about", content);
      setProject(updated);
      setSaveSuccess("Saved.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <p className="p-10 text-sm text-rose-600">{loadError}</p>;
  if (!project || !content) return <Spinner />;

  const previewConfig = {
    templateId: project.templateId,
    themeId: project.themeId,
    motionId: project.motionId,
    pages: ["about" as const],
    brandName: project.brandName,
    contentOverrides: { about: content },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="mb-4 text-sm text-slate-400 hover:text-slate-700"
      >
        ← Back to project
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Edit About page</h1>
          <p className="text-sm text-slate-500">{project.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && <span className="text-sm text-emerald-600">{saveSuccess}</span>}
          <Button variant="ghost" size="sm" type="button" onClick={resetToDefault}>
            Reset to default
          </Button>
          <Button type="button" loading={saving} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      {saveError && <p className="mb-4 text-sm text-rose-600">{saveError}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-slate-800">Header</h2>
            <Input
              label="Headline"
              name="h1"
              textarea
              value={content.h1}
              onChange={(e) => update({ h1: e.target.value })}
            />
            <Input
              label="Subheading"
              name="lede"
              textarea
              value={content.lede}
              onChange={(e) => update({ lede: e.target.value })}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-slate-800">Values</h2>
            <Input
              label="Section heading"
              name="valuesHeading"
              value={content.valuesHeading}
              onChange={(e) => update({ valuesHeading: e.target.value })}
            />
            <TitleBodyListEditor
              items={content.values}
              itemLabel="value"
              onChange={(values) => update({ values })}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-slate-800">Call-to-action</h2>
            <Input
              label="Title"
              name="ctaTitle"
              value={content.ctaTitle}
              onChange={(e) => update({ ctaTitle: e.target.value })}
            />
            <Input
              label="Body"
              name="ctaBody"
              textarea
              value={content.ctaBody}
              onChange={(e) => update({ ctaBody: e.target.value })}
            />
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Live preview</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
            <ScaledFrame config={previewConfig} cropHeight={640} interactive />
          </div>
        </div>
      </div>
    </div>
  );
}
