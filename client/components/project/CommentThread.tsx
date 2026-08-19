// components/project/CommentThread.tsx
"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import type { ProjectComment } from "@/types";

function timeAgo(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface CommentThreadProps {
  comments?: ProjectComment[];
  onAddComment?: (text: string) => Promise<void> | void;
}

export default function CommentThread({ comments = [], onAddComment }: CommentThreadProps) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      await onAddComment?.(text.trim());
      setText("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {comments.length === 0 && <p className="text-sm text-slate-400">No comments yet.</p>}
        {comments.map((c, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {c.authorName}{" "}
                <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  {c.authorType === "client" ? "Client" : "You"}
                </span>
              </span>
              <span className="text-[11px] text-slate-400">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-600">{c.text}</p>
          </div>
        ))}
      </div>

      {onAddComment && (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a note for the client…"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <Button type="submit" size="sm" loading={posting}>
            Post
          </Button>
        </form>
      )}
    </div>
  );
}
