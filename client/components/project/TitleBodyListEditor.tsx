// components/project/TitleBodyListEditor.tsx
// Reusable add/edit/remove list editor for the { title, body } shape shared
// by process steps (Home page) and values (About page) — one editor, two uses.
"use client";

import Button from "@/components/ui/Button";

export interface TitleBodyItem {
  title: string;
  body: string;
}

interface TitleBodyListEditorProps {
  items: TitleBodyItem[];
  onChange: (items: TitleBodyItem[]) => void;
  itemLabel: string; // e.g. "step" or "value" — used in the "Add ___" button and empty items
}

export default function TitleBodyListEditor({ items, onChange, itemLabel }: TitleBodyListEditorProps) {
  function updateItem(index: number, patch: Partial<TitleBodyItem>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function addItem() {
    onChange([...items, { title: "", body: "" }]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {itemLabel} {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-xs font-medium text-slate-400 hover:text-rose-600"
            >
              Remove
            </button>
          </div>
          <input
            value={item.title}
            onChange={(e) => updateItem(i, { title: e.target.value })}
            placeholder="Title"
            className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <textarea
            value={item.body}
            onChange={(e) => updateItem(i, { body: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={addItem}>
        + Add {itemLabel}
      </Button>
    </div>
  );
}
