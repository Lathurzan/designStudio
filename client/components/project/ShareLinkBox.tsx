// components/project/ShareLinkBox.tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface ShareLinkBoxProps {
  shareToken: string;
  onRegenerate?: () => Promise<void> | void;
}

export default function ShareLinkBox({ shareToken, onRegenerate }: ShareLinkBoxProps) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/preview/${shareToken}` : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleRegenerate() {
    if (!confirm("This invalidates the old link — anyone with it will lose access. Continue?")) return;
    setRegenerating(true);
    try {
      await onRegenerate?.();
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Client preview link
      </p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
        />
        <Button type="button" size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={regenerating}
        className="mt-2 text-xs font-medium text-slate-400 hover:text-rose-600 disabled:opacity-50"
      >
        {regenerating ? "Regenerating…" : "Regenerate link"}
      </button>
    </div>
  );
}
