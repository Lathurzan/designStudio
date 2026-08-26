// components/project/TemplatePicker.tsx
// Lets a freelancer pick Template + Theme + Motion + Pages, with real live
// iframe previews at every level (not colour circles, not screenshots) —
// reuses the exact same buildPrototypeDoc() that renders the client's
// actual preview page later, so what you pick here is what they'll see.
// Also handles "one by one" mode: per-section template overrides. The Live
// preview panel at the bottom needs zero special-casing for this — it
// already renders buildPrototypeDoc(value), which respects
// value.sectionTemplates automatically. Click through the nav inside it
// (it's interactive) to see how each mixed section actually looks.
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

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[];
const THEME_IDS = Object.keys(THEMES) as ThemeId[];
const MOTION_IDS = Object.keys(MOTION) as MotionId[];

const SECTION_ROWS: { key: SectionKey; label: string }[] = [
  { key: "chrome", label: "Navbar & Footer" },
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "services", label: "Services" },
  { key: "contact", label: "Contact" },
  { key: "login", label: "Login" },
];

interface TemplatePickerProps {
  value: PrototypeConfig;
  onChange: (config: PrototypeConfig) => void;
}

function hasAnyOverride(config: PrototypeConfig): boolean {
  return Boolean(
    config.sectionTemplates && Object.values(config.sectionTemplates).some((v) => v !== undefined)
  );
}

export default function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(hasAnyOverride(value));

  function update(patch: Partial<PrototypeConfig>) {
    onChange({ ...value, ...patch });
  }

  function togglePage(page: PageId) {
    if (page === "home") return; // always required — the client always has a landing page
    const has = value.pages.includes(page);
    const next = has
      ? value.pages.filter((p) => p !== page)
      : PAGE_ORDER.filter((p) => [...value.pages, page].includes(p));
    update({ pages: next });
  }

  function toggleAdvanced() {
    if (showAdvanced) {
      // switching back to "Common" — clear every per-section override
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
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Choose a template</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {TEMPLATE_IDS.map((tid) => {
            const meta = TEMPLATE_META[tid];
            const selected = value.templateId === tid;
            return (
              <button
                key={tid}
                type="button"
                onClick={() => update({ templateId: tid, themeId: meta.defaultTheme })}
                className={`overflow-hidden rounded-2xl border-2 text-left transition-colors ${
                  selected ? "border-indigo-600" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <ScaledFrame
                  config={{ templateId: tid, themeId: meta.defaultTheme, motionId: "smooth", pages: ["home"] }}
                  cropHeight={140}
                />
                <div className="p-3">
                  <p className="text-sm font-semibold text-slate-900">{meta.layoutName}</p>
                  <p className="text-xs text-slate-500">{meta.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          This is the default — every section uses it unless you customize one below.
        </p>
      </div>

      {/* ---------- theme ---------- */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Colour</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {THEME_IDS.map((thid) => {
            const t = THEMES[thid];
            const selected = value.themeId === thid;
            return (
              <button
                key={thid}
                type="button"
                onClick={() => update({ themeId: thid })}
                title={t.vibe}
                className={`overflow-hidden rounded-xl border-2 text-left transition-colors ${
                  selected ? "border-indigo-600" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <ScaledFrame
                  config={{ templateId: value.templateId, themeId: thid, motionId: value.motionId, pages: ["home"] }}
                  cropHeight={72}
                />
                <p className="px-2 py-1.5 text-[11px] font-medium text-slate-700">{t.label}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-400">Colour and motion always apply site-wide — only layout can be mixed per section.</p>
      </div>

      {/* ---------- motion ---------- */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Motion</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {MOTION_IDS.map((mid) => {
            const m = MOTION[mid];
            const selected = value.motionId === mid;
            return (
              <button
                key={mid}
                type="button"
                onClick={() => update({ motionId: mid })}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  selected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <p className="mb-1 text-sm font-semibold text-slate-900">{m.label}</p>
                <p className="text-xs text-slate-500">{m.copy}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- pages ---------- */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Pages</h3>
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
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  on ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-600 hover:border-indigo-400"
                } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {PAGE_LABELS[p]}
                {locked ? " (always on)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- per-section templates ("one by one" mode) ---------- */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Per-section templates</h3>
            <p className="text-xs text-slate-400">
              {showAdvanced
                ? "Pick a different template for any section — leave the rest on the default."
                : "Every section currently uses the same template above."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAdvanced}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              showAdvanced
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 text-slate-600 hover:border-indigo-400"
            }`}
          >
            {showAdvanced ? "One by one" : "Common"}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-1 rounded-xl border border-slate-200 p-3">
            {visibleSectionRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3 py-1.5">
                <span className="text-sm text-slate-700">{row.label}</span>
                <select
                  value={value.sectionTemplates?.[row.key] ?? ""}
                  onChange={(e) => updateSectionTemplate(row.key, e.target.value as TemplateId | "")}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Same as default ({TEMPLATE_META[value.templateId].layoutName})</option>
                  {TEMPLATE_IDS.map((tid) => (
                    <option key={tid} value={tid}>
                      {TEMPLATE_META[tid].layoutName}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- live preview ---------- */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Live preview</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <ScaledFrame config={value} cropHeight={460} interactive />
        </div>
        {showAdvanced && (
          <p className="mt-2 text-xs text-slate-400">
            Click through the nav above to see each page's actual template — the preview is fully interactive.
          </p>
        )}
      </div>
    </div>
  );
}
