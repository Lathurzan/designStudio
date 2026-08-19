// components/project/ScaledFrame.tsx
// Renders buildPrototypeDoc() inside an iframe, scaled down to fit whatever
// width its container actually is (measured live via ResizeObserver — no
// fixed pixel widths, works in a responsive grid at any breakpoint), then
// clipped to `cropHeight` so you get a clean "peek" rather than the whole page.
// Extracted from TemplatePicker so editor pages can reuse the exact same
// live-preview mechanism instead of re-implementing it.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildPrototypeDoc, type PrototypeConfig } from "@/lib/templateEngine";

export default function ScaledFrame({
  config,
  cropHeight,
  interactive = false,
}: {
  config: PrototypeConfig;
  cropHeight: number;
  interactive?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const html = useMemo(
    () => buildPrototypeDoc(config),
    // pages is an array, and contentOverrides/brandName can change on every keystroke in an
    // editor — compare by content, not reference, so the preview actually updates live
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      config.templateId,
      config.themeId,
      config.motionId,
      config.pages.join(","),
      config.brandName,
      JSON.stringify(config.contentOverrides),
    ]
  );

  const DESIGN_WIDTH = 1280;
  const DESIGN_HEIGHT = 1800; // generous so the crop never reveals blank space below real content
  const scale = width > 0 ? width / DESIGN_WIDTH : 0;

  return (
    <div ref={wrapRef} style={{ height: cropHeight, position: "relative", overflow: "hidden", background: "#F6F7FB" }}>
      {scale > 0 && (
        <iframe
          srcDoc={html}
          title="Website preview"
          tabIndex={-1}
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: interactive ? "auto" : "none",
          }}
        />
      )}
    </div>
  );
}
