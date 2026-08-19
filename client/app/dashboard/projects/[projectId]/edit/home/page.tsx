// app/dashboard/projects/[projectId]/edit/home/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getDefaultPageContent, type ContentHome } from "@/lib/templateEngine";
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

export default function EditHomePage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState<ContentHome | null>(null);
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
    if (!content) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const updated = await api.updatePageContent(projectId, "home", content);
      setProject(updated);
      setSaveSuccess("Saved.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
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

  if (loadError) return <p className="p-10 text-sm text-rose-600">{loadError}</p>;
  if (!project || !content) return <Spinner />;

  const previewConfig = {
    templateId: project.templateId,
    themeId: project.themeId,
    motionId: project.motionId,
    pages: ["home" as const],
    brandName: project.brandName,
    contentOverrides: { home: content },
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
          <h1 className="text-xl font-semibold text-slate-900">Edit Home page</h1>
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
            <h2 className="text-sm font-semibold text-slate-800">Hero</h2>
            <Input
              label="Eyebrow tag"
              name="eyebrow"
              value={content.eyebrow}
              onChange={(e) => update({ eyebrow: e.target.value })}
            />
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
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Primary button text"
                name="cta1"
                value={content.cta1}
                onChange={(e) => update({ cta1: e.target.value })}
              />
              <Input
                label="Secondary button text"
                name="cta2"
                value={content.cta2}
                onChange={(e) => update({ cta2: e.target.value })}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Stats under the hero</h2>
            <div className="space-y-2">
              {content.stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s.n}
                    onChange={(e) => updateStat(i, { n: e.target.value })}
                    placeholder="180+"
                    className="w-24 rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <input
                    value={s.l}
                    onChange={(e) => updateStat(i, { l: e.target.value })}
                    placeholder="Engagements delivered"
                    className="flex-1 rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <button type="button" onClick={() => removeStat(i)} className="text-xs text-slate-400 hover:text-rose-600">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addStat}>
              + Add stat
            </Button>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Client logos strip</h2>
            <div className="space-y-2">
              {content.logos.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={l}
                    onChange={(e) => updateLogo(i, e.target.value)}
                    placeholder="CLIENT NAME"
                    className="flex-1 rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <button type="button" onClick={() => removeLogo(i)} className="text-xs text-slate-400 hover:text-rose-600">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={addLogo}>
              + Add logo
            </Button>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-slate-800">Services section</h2>
            <Input
              label="Section heading"
              name="servicesHeading"
              value={content.servicesHeading}
              onChange={(e) => update({ servicesHeading: e.target.value })}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-slate-800">Testimonial</h2>
            <Input label="Quote" name="quote" textarea value={content.quote} onChange={(e) => update({ quote: e.target.value })} />
            <Input
              label="Attribution"
              name="quoteBy"
              value={content.quoteBy}
              onChange={(e) => update({ quoteBy: e.target.value })}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-slate-800">Call-to-action band</h2>
            <Input
              label="Title"
              name="ctaBandTitle"
              value={content.ctaBandTitle}
              onChange={(e) => update({ ctaBandTitle: e.target.value })}
            />
            <Input
              label="Body"
              name="ctaBandBody"
              textarea
              value={content.ctaBandBody}
              onChange={(e) => update({ ctaBandBody: e.target.value })}
            />
          </Card>

          {content.process && (
            <Card className="space-y-4 p-5">
              <h2 className="text-sm font-semibold text-slate-800">Process section</h2>
              <Input
                label="Section heading"
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
          )}

          {content.selectedWork && (
            <Card className="space-y-4 p-5">
              <h2 className="text-sm font-semibold text-slate-800">Selected work section</h2>
              <Input
                label="Section heading"
                name="selectedWorkHeading"
                value={content.selectedWork.heading}
                onChange={(e) => update({ selectedWork: { ...content.selectedWork!, heading: e.target.value } })}
              />
              <div className="space-y-3">
                {content.selectedWork.items.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Project {i + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          update({
                            selectedWork: {
                              ...content.selectedWork!,
                              items: content.selectedWork!.items.filter((_, idx) => idx !== i),
                            },
                          })
                        }
                        className="text-xs font-medium text-slate-400 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      value={item.title}
                      onChange={(e) =>
                        update({
                          selectedWork: {
                            ...content.selectedWork!,
                            items: content.selectedWork!.items.map((it, idx) =>
                              idx === i ? { ...it, title: e.target.value } : it
                            ),
                          },
                        })
                      }
                      placeholder="Project title"
                      className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <input
                      value={item.meta}
                      onChange={(e) =>
                        update({
                          selectedWork: {
                            ...content.selectedWork!,
                            items: content.selectedWork!.items.map((it, idx) =>
                              idx === i ? { ...it, meta: e.target.value } : it
                            ),
                          },
                        })
                      }
                      placeholder="Location — year"
                      className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <textarea
                      value={item.body}
                      onChange={(e) =>
                        update({
                          selectedWork: {
                            ...content.selectedWork!,
                            items: content.selectedWork!.items.map((it, idx) =>
                              idx === i ? { ...it, body: e.target.value } : it
                            ),
                          },
                        })
                      }
                      placeholder="Short description"
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  update({
                    selectedWork: {
                      ...content.selectedWork!,
                      items: [...content.selectedWork!.items, { title: "", meta: "", body: "" }],
                    },
                  })
                }
              >
                + Add project
              </Button>
            </Card>
          )}
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
