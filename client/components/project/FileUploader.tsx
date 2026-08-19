// components/project/FileUploader.tsx
// Plain <input type="file"> -> FormData -> POST /projects/:id/upload.
// No direct-to-Cloudinary signing on the frontend — the server holds the
// Cloudinary keys and does the upload, so nothing sensitive ships to the browser.
"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import type { ProjectFile } from "@/types";

interface FileUploaderProps {
  projectId: string;
  onUploaded?: (files: ProjectFile[]) => void;
}

export default function FileUploader({ projectId, onUploaded }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(fileList).forEach((file) => formData.append("files", file));
      const data = await api.uploadFiles(projectId, formData);
      onUploaded?.(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        loading={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading…" : "Upload files"}
      </Button>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
