// components/project/TemplatePicker.tsx
"use client";

import { useState } from "react";
import {
  TEMPLATE_META,
  THEMES,
  MOTION,
  PAGE_ORDER,
  PAGE_LABELS,
  type TemplateId,
  type ThemeId,
  type MotionId,
  type PageId,
  type SectionKey,
  type PrototypeConfig,
} from "@/lib/templateEngine";
import ScaledFrame from "./ScaledFrame";
import ResponsiveDeviceFrame from "./ResponsiveDeviceFrame";

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[];
const THEME_IDS = Object.keys(THEMES) as ThemeId[];
const MOTION_IDS = Object.keys(MOTION) as MotionId[];

const SECTION_ROWS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "chrome", label: "Navbar & Footer", icon: "🌐" },
  { key: "home", label: "Home Page", icon: "🏠" },
  { key: "about", label: "About Page", icon: "📖" },
  { key: "services", label: "Services Page", icon: "💼" },
  { key: "contact", label: "Contact Page", icon: "✉️" },
  { key: "login", label: "Login Page", icon: "🔐" },
];

interface TemplatePickerProps {
  value: PrototypeConfig;
  onChange: (config: PrototypeConfig) => void;
  showPreview?: boolean;
}

function hasAnyOverride(config: PrototypeConfig): boolean {
  return Boolean(
    config.sectionTemplates && Object.values(config.sectionTemplates).some((v) => v !== undefined)
  );
}

export default function TemplatePicker({ value, onChange, showPreview = true }: TemplatePickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(hasAnyOverride(value));

  function update(patch: Partial<PrototypeConfig>) {
    onChange({ ...value, ...patch });
  }

  function togglePage(page: PageId) {
    if (page === "home") return; // always required
    const has = value.pages.includes(page);
    const next = has
      ? value.pages.filter((p) => p !== page)
      : PAGE_ORDER.filter((p) => [...value.pages, page].includes(p));
    update({ pages: next });
  }

  function toggleAdvanced() {
    if (showAdvanced) {
      setShowAdvanced(false);
      onChange({ ...value, sectionTemplates: undefined });
    } else {
      setShowAdvanced(true);
    }
  }

  function updateSectionTemplate(section: SectionKey, templateId: TemplateId | "") {
    const next = { ...(value.sectionTemplates || {}) };
    if (templateId === "") {
      delete next[section];
    } else {
      next[section] = templateId;
    }
    onChange({ ...value, sectionTemplates: next });
  }

  const visibleSectionRows = SECTION_ROWS.filter(
    (row) => row.key === "chrome" || value.pages.includes(row.key as PageId)
  );

  return (
    <div className="space-y-8">
      {/* ---------- template ---------- */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">01. Starting Design Template</h3>
          <span className="text-xs text-slate-400">3 Curated Aesthetics</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TEMPLATE_IDS.map((tid) => {
            const meta = TEMPLATE_META[tid];
            const selected = value.templateId === tid;
            return (
              <button
                key={tid}
                type="button"
                onClick={() => update({ templateId: tid, themeId: meta.defaultTheme })}
                className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ${
                  selected
                    ? "border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                {selected && (
                  <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <div className="overflow-hidden bg-slate-100">
                  <ScaledFrame
                    config={{ templateId: tid, themeId: meta.defaultTheme, motionId: "smooth", pages: ["home"] }}
                    cropHeight={140}
                  />
                </div>
                <div className="bg-white p-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{meta.layoutName}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {meta.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">{meta.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          This applies as the default layout — you can mix and match individual sections below.
        </p>
      </div>

      {/* ---------- theme ---------- */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">02. Curated Colour Palette</h3>
          <span className="text-xs text-slate-400">Applied Site-Wide</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {THEME_IDS.map((thid) => {
            const t = THEMES[thid];
            const selected = value.themeId === thid;
            return (
              <button
                key={thid}
                type="button"
                onClick={() => update({ themeId: thid })}
                title={t.vibe}
                className={`flex flex-col items-start overflow-hidden rounded-xl border-2 p-2.5 text-left transition-all ${
                  selected
                    ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 w-full mb-2">
                  <span className="h-4 w-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: t.primary }} />
                  <span className="h-4 w-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: t.accent }} />
                  <span className="h-4 w-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: t.c900 }} />
                </div>
                <p className="text-xs font-bold text-slate-900">{t.label}</p>
                <p className="text-[10px] text-slate-500 truncate w-full">{t.vibe}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- motion ---------- */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">03. Animation &amp; Motion Feel</h3>
          <span className="text-xs text-slate-400">Timing &amp; Reveal Physics</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {MOTION_IDS.map((mid) => {
            const m = MOTION[mid];
            const selected = value.motionId === mid;
            return (
              <button
                key={mid}
                type="button"
                onClick={() => update({ motionId: mid })}
                className={`rounded-xl border-2 p-3.5 text-left transition-all ${
                  selected
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-slate-900">{m.label}</p>
                  <span className="font-mono text-[10px] text-slate-400">{m.dur}</span>
                </div>
                <p className="text-xs text-slate-500">{m.copy}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- pages ---------- */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">04. Included Pages</h3>
          <span className="text-xs text-slate-400">Toggle Navigation Tabs</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PAGE_ORDER.map((p) => {
            const on = value.pages.includes(p);
            const locked = p === "home";
            return (
              <button
                key={p}
                type="button"
                disabled={locked}
                onClick={() => togglePage(p)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                  on
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                    : "border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
                } ${locked ? "cursor-not-allowed opacity-75" : ""}`}
              >
                {on && <span>✓</span>}
                {PAGE_LABELS[p]}
                {locked && <span className="text-[10px] opacity-80">(Required)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- per-section templates ("one by one" mode) ---------- */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">05. Design Flexibility Mode</h3>
            <p className="text-xs text-slate-500">
              {showAdvanced
                ? "One-by-one mode: Mix and match templates section by section (e.g. Modern nav with Minimal about)."
                : "Common mode: One unified template applies across the whole website."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAdvanced}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
              showAdvanced
                ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
            }`}
          >
            <span>{showAdvanced ? "⚡ One by one (Active)" : "✨ Switch to One by One"}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            {visibleSectionRows.map((row) => (
              <div key={row.key} className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{row.icon}</span>
                  <span className="text-xs font-semibold text-slate-800">{row.label}</span>
                </div>
                <select
                  value={value.sectionTemplates?.[row.key] ?? ""}
                  onChange={(e) => updateSectionTemplate(row.key, e.target.value as TemplateId | "")}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                >
                  <option value="">Default ({TEMPLATE_META[value.templateId].layoutName})</option>
                  {TEMPLATE_IDS.map((tid) => (
                    <option key={tid} value={tid}>
                      {TEMPLATE_META[tid].layoutName} ({TEMPLATE_META[tid].category})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- live preview canvas ---------- */}
      {showPreview && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">06. Live Scrollable &amp; Clickable Canvas</h3>
            <span className="text-xs text-slate-400">Interactive Multi-Device Canvas</span>
          </div>
          <ResponsiveDeviceFrame
            config={value}
            title={`${TEMPLATE_META[value.templateId].layoutName} Prototype`}
          />
        </div>
      )}
    </div>
  );
}
