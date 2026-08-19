// components/ui/Input.tsx
"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseProps {
  label?: string;
  className?: string;
}

// Discriminated union: textarea:true unlocks <textarea>-only attributes (rows, etc.)
// and switches which element actually renders.
type InputOnlyProps = BaseProps & { textarea?: false } & InputHTMLAttributes<HTMLInputElement>;
type TextareaOnlyProps = BaseProps & { textarea: true } & TextareaHTMLAttributes<HTMLTextAreaElement>;

export type InputProps = InputOnlyProps | TextareaOnlyProps;

export default function Input(props: InputProps) {
  const { label, className = "", textarea, ...rest } = props;
  const fieldClasses = `w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
    textarea ? "min-h-[90px] resize-y" : ""
  } ${className}`;

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      {textarea ? (
        <textarea className={fieldClasses} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input className={fieldClasses} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </label>
  );
}
