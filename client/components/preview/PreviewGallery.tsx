// components/preview/PreviewGallery.tsx
"use client";

import { useState } from "react";
import type { ProjectFile } from "@/types";

export default function PreviewGallery({ files = [] }: { files?: ProjectFile[] }) {
  const [active, setActive] = useState<ProjectFile | null>(null);
  const images = files.filter((f) => f.type === "image");
  const others = files.filter((f) => f.type !== "image");

  if (files.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-16 text-center text-sm text-slate-400">
        Nothing has been uploaded for review yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((file, i) => (
          <button
            key={file.publicId || i}
            onClick={() => setActive(file)}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <img
              src={file.url}
              alt={file.originalName || "Design preview"}
              className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {others.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {others.map((file, i) => (
            <a
              key={file.publicId || i}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              {file.originalName || "File"}
            </a>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6"
          onClick={() => setActive(null)}
        >
          <img
            src={active.url}
            alt={active.originalName || "Design preview"}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
