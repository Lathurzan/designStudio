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
import ScaledFrame from "@/components/project/ScaledFrame";
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
      // sequential, not Promise.all — these are two separate read-modify-write requests
      // against the same project.content object; running them concurrently could let
      // whichever finishes second silently overwrite the other's change
      await api.updatePageContent(projectId, "nav", nav);
      const updated = await api.updatePageContent(projectId, "footer", footer);
      if (isSetupFlow) {
        // nav-footer is always the last step, so this lands on the finished project page
        router.push(nextStepPath(projectId, updated.pages, "nav-footer"));
        return;
      }
      setProject(updated);
      setSaveSuccess("Saved.");
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

  if (loadError) return <p className="p-10 text-sm text-rose-600">{loadError}</p>;
  if (!project || !nav || !footer) return <Spinner />;

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
    <div className="mx-auto max-w-6xl px-6 py-10">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="mb-4 text-sm text-slate-400 hover:text-slate-700"
      >
        ← Back to project
      </button>

      {isSetupFlow && <SetupFlowBar pages={project.pages} currentStepId="nav-footer" onSkip={handleSkip} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Edit navbar &amp; footer</h1>
          <p className="text-sm text-slate-500">{project.name} — shared across every page</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && <span className="text-sm text-emerald-600">{saveSuccess}</span>}
          <Button variant="ghost" size="sm" type="button" onClick={resetToDefault}>
            Reset to default
          </Button>
          <Button type="button" loading={saving} onClick={handleSave}>
            {isSetupFlow ? "Finish setup" : "Save"}
          </Button>
        </div>
      </div>

      {saveError && <p className="mb-4 text-sm text-rose-600">{saveError}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-slate-800">Navbar</h2>
            <Input
              label="Primary button text"
              name="navCta"
              value={nav.ctaText}
              onChange={(e) => setNav({ ...nav, ctaText: e.target.value })}
            />
            <Input
              label="Login button text"
              name="navLogin"
              value={nav.loginText}
              onChange={(e) => setNav({ ...nav, loginText: e.target.value })}
            />
            <p className="text-xs text-slate-400">The login button only shows if the Login page is included.</p>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-slate-800">Footer</h2>
            <Input
              label="Tagline"
              name="footerTagline"
              value={footer.tagline}
              onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
            />
            <Input
              label="Bottom note"
              name="footerNote"
              textarea
              value={footer.bottomNote}
              onChange={(e) => setFooter({ ...footer, bottomNote: e.target.value })}
            />
            <p className="text-xs text-slate-400">
              Shown as: © {new Date().getFullYear()} {project.brandName || "Business name"}. {footer.bottomNote}
            </p>
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
