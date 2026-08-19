// components/project/TemplatePicker.tsx
// Lets a freelancer pick Template + Theme + Motion + Pages, with real live
// iframe previews at every level (not colour circles, not screenshots) —
// reuses the exact same buildPrototypeDoc() that renders the client's
// actual preview page later, so what you pick here is what they'll see.
"use client";

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
  type PrototypeConfig,
} from "@/lib/templateEngine";
import ScaledFrame from "./ScaledFrame";

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[];
const THEME_IDS = Object.keys(THEMES) as ThemeId[];
const MOTION_IDS = Object.keys(MOTION) as MotionId[];

interface TemplatePickerProps {
  value: PrototypeConfig;
  onChange: (config: PrototypeConfig) => void;
}

export default function TemplatePicker({ value, onChange }: TemplatePickerProps) {
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

      {/* ---------- live preview ---------- */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Live preview</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <ScaledFrame config={value} cropHeight={460} interactive />
        </div>
      </div>
    </div>
  );
}
