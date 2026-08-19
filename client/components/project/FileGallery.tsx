// components/project/FileGallery.tsx
import type { ProjectFile } from "@/types";

interface FileGalleryProps {
  files?: ProjectFile[];
  emptyHint?: string;
}

export default function FileGallery({ files = [], emptyHint = "No files uploaded yet." }: FileGalleryProps) {
  if (files.length === 0) {
    return <p className="text-sm text-slate-400">{emptyHint}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {files.map((file, i) => (
        <a
          key={file.publicId || i}
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        >
          {file.type === "image" ? (
            <img
              src={file.url}
              alt={file.originalName || "Uploaded file"}
              className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 text-slate-400">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <span className="px-2 text-center text-[11px]">{file.originalName || "File"}</span>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
