// components/project/ResponsiveDeviceFrame.tsx
"use client";

import { useState } from "react";
import ScaledFrame from "./ScaledFrame";
import type { PrototypeConfig } from "@/lib/templateEngine";

interface ResponsiveDeviceFrameProps {
  config: PrototypeConfig;
  title?: string;
  defaultViewport?: "desktop" | "tablet" | "mobile";
  interactive?: boolean;
}

export default function ResponsiveDeviceFrame({
  config,
  title,
  defaultViewport = "desktop",
  interactive = true,
}: ResponsiveDeviceFrameProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(defaultViewport);
  const [isInteractive, setIsInteractive] = useState(interactive);
  const [key, setKey] = useState(0);

  const containerWidth = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  }[viewport];

  function handleReload() {
    setKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          {title && <span className="ml-2 text-xs font-semibold text-slate-700 truncate">{title}</span>}
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              viewport === "desktop" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              viewport === "tablet" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              viewport === "mobile" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>Mobile</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInteractive((v) => !v)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              isInteractive ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Toggle Live Interaction"
          >
            {isInteractive ? "⚡ Live Clickable" : "👁 Static View"}
          </button>
          <button
            type="button"
            onClick={handleReload}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Reload Prototype"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex min-h-[520px] items-start justify-center p-4 transition-all duration-300">
        <div
          key={key}
          className={`w-full overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-xl transition-all duration-300 ${containerWidth}`}
        >
          <ScaledFrame
            config={config}
            cropHeight={580}
            interactive={isInteractive}
          />
        </div>
      </div>
    </div>
  );
}
