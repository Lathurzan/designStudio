// app/dashboard/projects/new/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PAGE_ORDER, type PrototypeConfig } from "@/lib/templateEngine";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import TemplatePicker from "@/components/project/TemplatePicker";

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

      router.push(`/dashboard/projects/${project._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">New project</h1>
      <p className="mb-6 text-sm text-slate-500">
        Pick a template to start from, then add the client's details. You can fine-tune the
        design any time from the project page.
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
