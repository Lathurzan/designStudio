// components/marketing/PricingCard.tsx
import Link from "next/link";

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

export default function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-7 ${
        tier.highlighted
          ? "border-indigo-600 bg-white shadow-lg shadow-indigo-100 ring-1 ring-indigo-600"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      {tier.highlighted && (
        <span className="absolute -top-3 left-7 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          Most popular
        </span>
      )}

      <h3 className="text-sm font-semibold text-slate-900">{tier.name}</h3>
      <p className="mt-1 text-xs text-slate-500">{tier.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">{tier.price}</span>
        <span className="text-sm text-slate-500">{tier.period}</span>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={tier.href}
        className={`mt-7 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
          tier.highlighted
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
        }`}
      >
        {tier.cta}
      </Link>
    </div>
  );
}
