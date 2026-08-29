// components/project/ImageSlotPicker.tsx
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { api } from "@/lib/api";
import type { ProjectFile } from "@/types";

export interface ImageSlotPickerProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  projectId?: string;
  projectFiles?: ProjectFile[];
  hint?: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide" | "circle";
  compact?: boolean;
}

const CURATED_PRESETS: { category: string; items: { label: string; url: string }[] }[] = [
  {
    category: "Hero & Architecture",
    items: [
      {
        label: "Modern Minimal Interior",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        label: "Architectural Studio Space",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        label: "Contemporary Concrete Villa",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      },
      {
        label: "Creative Tech Workspace",
        url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    category: "Projects & Portfolio",
    items: [
      {
        label: "Minimal Brand Identity",
        url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80",
      },
      {
        label: "Editorial Design Book",
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      },
      {
        label: "Modern Mobile App UI",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      },
      {
        label: "Dark Luxury Packaging",
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    category: "Portraits & Avatars",
    items: [
      {
        label: "Priya Nandakumar (COO)",
        url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      },
      {
        label: "Marcus Feld (Architect)",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
      {
        label: "Dana Okafor (Founder)",
        url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      },
      {
        label: "Julian Vance (Partner)",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
];

export default function ImageSlotPicker({
  label,
  value,
  onChange,
  projectId,
  projectFiles = [],
  hint,
  aspectRatio = "video",
  compact = false,
}: ImageSlotPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "upload" | "files" | "url">("presets");
  const [customUrl, setCustomUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
    circle: "aspect-square rounded-full",
  }[aspectRatio];

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !projectId) return;

    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("files", files[0]);
      const res = await api.uploadFiles(projectId, formData);
      if (res.files && res.files.length > 0) {
        const uploaded = res.files[res.files.length - 1];
        onChange(uploaded.url);
        setModalOpen(false);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSelect(url: string) {
    onChange(url);
    setModalOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      {value ? (
        <div
          className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${
            compact ? "h-24 w-full" : aspectClass
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm hover:bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-rose-600"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`group flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50/40 ${
            compact ? "h-20" : aspectClass
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-indigo-600 shadow-xs ring-1 ring-slate-200 transition-all group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:ring-indigo-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="mt-2 text-xs font-medium text-slate-600 group-hover:text-indigo-600">
            Click to add image
          </span>
        </button>
      )}

      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add Image</h3>
                <p className="text-xs text-slate-500">Pick a curated preset, upload from your device, or enter a URL</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-6">
              {[
                { id: "presets", label: "Curated Presets" },
                { id: "upload", label: "Upload File" },
                { id: "files", label: `Project Assets (${projectFiles.length})` },
                { id: "url", label: "Custom URL" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "presets" && (
                <div className="space-y-6">
                  {CURATED_PRESETS.map((group) => (
                    <div key={group.category}>
                      <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {group.category}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {group.items.map((item) => (
                          <button
                            key={item.url}
                            type="button"
                            onClick={() => handleSelect(item.url)}
                            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 text-left transition-all hover:border-indigo-500 hover:shadow-md"
                          >
                            <div className="aspect-video w-full overflow-hidden bg-slate-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.url}
                                alt={item.label}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <span className="p-2 text-[11px] font-medium text-slate-700 truncate">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "upload" && (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Upload an image from your computer</h4>
                  <p className="mt-1 text-xs text-slate-500">Supports PNG, JPG, WebP, SVG up to 10MB</p>
                  {uploadError && <p className="mt-2 text-xs text-rose-600">{uploadError}</p>}
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploading ? "Uploading…" : "Browse Files"}
                  </button>
                </div>
              )}

              {activeTab === "files" && (
                <div>
                  {projectFiles.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No reference assets uploaded for this project yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {projectFiles
                        .filter((f) => f.type === "image" || f.url.match(/\.(jpeg|jpg|png|webp|svg)$/i))
                        .map((file) => (
                          <button
                            key={file.url}
                            type="button"
                            onClick={() => handleSelect(file.url)}
                            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 text-left transition-all hover:border-indigo-500 hover:shadow-md"
                          >
                            <div className="aspect-video w-full overflow-hidden bg-slate-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={file.url}
                                alt={file.originalName || "Project asset"}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <span className="p-2 text-[11px] font-medium text-slate-700 truncate">
                              {file.originalName || "Uploaded asset"}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "url" && (
                <div className="space-y-4 py-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Direct Image URL
                    </label>
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  {customUrl && (
                    <div className="aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={customUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={!customUrl.trim()}
                    onClick={() => handleSelect(customUrl.trim())}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Apply Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
