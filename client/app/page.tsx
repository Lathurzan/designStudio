// app/page.tsx
// Public marketing landing page — nav (About us / Pricing / Login), hero,
// a short "how it works" section, three pricing tiers, and a final CTA band.
import Link from "next/link";
import { Fraunces } from "next/font/google";
import PricingCard, { type PricingTier } from "@/components/marketing/PricingCard";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500"], style: ["italic", "normal"] });

const TIERS: PricingTier[] = [
  {
    name: "Free",
    price: "£0",
    period: "/mo",
    tagline: "Try it out",
    features: ["1 active project", "Up to 5 files", "In-app preview only", "Community support"],
    cta: "Start for free",
    href: "/register",
  },
  {
    name: "Starter",
    price: "£2.99",
    period: "/mo",
    tagline: "For solo freelancers",
    features: [
      "Up to 10 active projects",
      "Unlimited file uploads",
      "Client comments & approvals",
      "Preview inside your dashboard only — no public link",
    ],
    cta: "Get started",
    href: "/register",
  },
  {
    name: "Pro",
    price: "£5.99",
    period: "/mo",
    tagline: "For growing studios",
    features: [
      "Unlimited projects",
      "Everything in Starter",
      "Shareable public preview link",
      "No login required for your clients",
    ],
    cta: "Get started",
    href: "/register",
    highlighted: true,
  },
];

const STEPS = [
  {
    title: "One link, not ten attachments",
    body: "Upload your designs once and share a single link instead of emailing files back and forth.",
  },
  {
    title: "Approvals your client can actually use",
    body: "No login required — clients click Approve or Request Changes right from the preview page.",
  },
  {
    title: "You stay in control",
    body: "Your dashboard tracks every project's status and comments in one place, not scattered across threads.",
  },
];

export default function Home() {
  return (
    <main className="bg-slate-50">
      {/* ---------- nav ---------- */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
            <span className="h-7 w-7 rounded-lg bg-indigo-600" />
            CollabPlatform
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
            <a href="#about" className="hover:text-slate-900">About us</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <Link href="/login" className="hover:text-slate-900">Login</Link>
          </div>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ---------- hero ---------- */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          For freelancers &amp; studios
        </span>
        <h1
          className={`${fraunces.className} text-4xl font-medium leading-[1.08] tracking-tight text-slate-900 sm:text-6xl`}
        >
          Show clients the work.
          <br />
          Skip the <em className="text-indigo-600">back-and-forth</em>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          Upload your designs, send one link, and let clients approve, request changes, or leave
          feedback — no account required on their side.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
          >
            Get started free
          </Link>
          <Link
            href="#pricing"
            className="w-full rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 sm:w-auto"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* ---------- about / how it works ---------- */}
      <section id="about" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 max-w-xl">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-indigo-600">
            About us
          </span>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Built for freelancers tired of email threads
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-600">
                {i + 1}
              </span>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Pricing
          </span>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Simple pricing, upgrade when you need it
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
            Every plan includes client comments and approvals. Public share links unlock on Pro.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-slate-900 px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Ready to stop chasing feedback in email?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
            Create your first project in under two minutes.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-slate-200 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-slate-600">
            <span className="h-5 w-5 rounded bg-indigo-600" />
            CollabPlatform
          </div>
          <p>© {new Date().getFullYear()} CollabPlatform. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
