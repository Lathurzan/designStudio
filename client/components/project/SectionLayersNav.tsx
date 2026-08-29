// components/project/SectionLayersNav.tsx
"use client";

export interface SectionLayerItem {
  id: string;
  name: string;
  category?: string;
  isCustomized?: boolean;
  hasImage?: boolean;
}

interface SectionLayersNavProps {
  sections: SectionLayerItem[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  pageTitle: string;
}

export default function SectionLayersNav({
  sections,
  activeSectionId,
  onSelectSection,
  pageTitle,
}: SectionLayersNavProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {pageTitle} Sections
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          {sections.length} layers
        </span>
      </div>

      <div className="space-y-1">
        {sections.map((sec, idx) => {
          const isActive = sec.id === activeSectionId;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                isActive
                  ? "bg-indigo-600 font-semibold text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`font-mono text-[10px] font-medium ${
                    isActive ? "text-indigo-200" : "text-slate-400 group-hover:text-slate-500"
                  }`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{sec.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {sec.hasImage && (
                  <span
                    title="Contains image asset"
                    className={`flex h-4 w-4 items-center justify-center rounded text-[10px] ${
                      isActive ? "bg-indigo-500 text-indigo-100" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    🖼
                  </span>
                )}
                {sec.isCustomized && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-emerald-300" : "bg-emerald-500"
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
