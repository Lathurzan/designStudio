// app/dashboard/projects/new/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PAGE_ORDER, type PrototypeConfig } from "@/lib/templateEngine";
import { getSetupSteps, stepPath } from "@/lib/setupFlow";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import TemplatePicker from "@/components/project/TemplatePicker";
import type { Project } from "@/types";

interface BasicsForm {
  name: string;
  clientName: string;
  clientEmail: string;
  description: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [basics, setBasics] = useState<BasicsForm>({
    name: "",
    clientName: "",
    clientEmail: "",
    description: "",
  });
  const [config, setConfig] = useState<PrototypeConfig>({
    templateId: "modern",
    themeId: "blue",
    motionId: "smooth",
    pages: [...PAGE_ORDER],
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);

  function update(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setBasics({ ...basics, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const project = await api.createProject({ ...basics, ...config });

      if (files && files.length > 0) {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));
        await api.uploadFiles(project._id, formData);
      }

      // Don't redirect straight to the project — offer the real choice: walk
      // through content one page at a time, or skip straight in with the
      // template's default wording.
      setCreatedProject(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  if (createdProject) {
    const firstStep = getSetupSteps(createdProject.pages)[0];
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-slate-900">
          &ldquo;{createdProject.name}&rdquo; is created
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          Want to write the actual wording now, one page at a time — or start from the
          template's default copy and edit it later?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push(stepPath(createdProject._id, firstStep.id))}>
            Customize content now
          </Button>
          <Button variant="ghost" onClick={() => router.push(`/dashboard/projects/${createdProject._id}`)}>
            Use template defaults
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">New project</h1>
      <p className="mb-6 text-sm text-slate-500">
        Pick a template to start from, then add the client's details. You'll be able to
        customize the wording right after, or leave it for later.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <TemplatePicker value={config} onChange={setConfig} />
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-sm font-semibold text-slate-800">Client details</h2>
          <Input
            label="Project name"
            name="name"
            required
            value={basics.name}
            onChange={update}
            placeholder="Meridian Studio — website redesign"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Client name"
              name="clientName"
              required
              value={basics.clientName}
              onChange={update}
              placeholder="Camille Reyes"
            />
            <Input
              label="Client email"
              name="clientEmail"
              type="email"
              value={basics.clientEmail}
              onChange={update}
              placeholder="camille@client.com"
            />
          </div>
          <Input
            label="Description (optional)"
            name="description"
            textarea
            value={basics.description}
            onChange={update}
            placeholder="A short note about the project…"
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Reference files (optional — a logo, brand guide, or moodboard)
            </span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setFiles(e.target.files)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </label>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              Create project
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
