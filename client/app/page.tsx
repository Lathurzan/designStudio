// app/page.tsx
// Public marketing landing page — rich aesthetic, dark-glass hero with
// live prototype simulation, Bento feature cards, and clear pricing tiers.
import Link from "next/link";
import { Fraunces } from "next/font/google";
import PricingCard, { type PricingTier } from "@/components/marketing/PricingCard";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], style: ["italic", "normal"] });

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

const BENTO_FEATURES = [
  {
    tag: "Design Flexibility",
    title: "One-by-One Section Mixing",
    body: "Mix and match templates section by section — e.g. Minimal about with Bold hero and Modern navigation — while color and motion stay unified.",
    icon: "⚡",
  },
  {
    tag: "Figma-Style Editing",
    title: "Section-by-Section Customization",
    body: "Click '+' to drop real mockups, architectural photography, or custom logos right into any section with instant live feedback.",
    icon: "🖼",
  },
  {
    tag: "Client Experience",
    title: "Zero-Login Client Approvals",
    body: "Clients open a single private link to scroll, navigate, and click 'Approve' or 'Request Changes' with threaded comments.",
    icon: "✨",
  },
];

export default function Home() {
  return (
    <main className="bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* ---------- nav ---------- */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 text-sm font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              ✦
            </span>
            <span className="tracking-tight text-base font-bold">DesignStudio</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 sm:flex">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ---------- hero ---------- */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center sm:pt-28 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute left-1/2 top-10 -translate-x-1/2 -z-10 h-72 w-[600px] rounded-full bg-indigo-600/15 blur-[120px]" />

        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 backdrop-blur-xs">
          ⚡ Next-Gen Client Design Reviews
        </span>
        <h1
          className={`${fraunces.className} text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl max-w-4xl mx-auto`}
        >
          Show clients the real work.
          <br />
          Skip the <em className="text-indigo-400 italic">endless revisions</em>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Generate live clickable website prototypes in seconds. Customize section-by-section like Figma, send one private link, and get client approvals instantly.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="w-full rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 sm:w-auto transition-all"
          >
            Start building for free
          </Link>
          <a
            href="#features"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-7 py-3.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white sm:w-auto transition-all"
          >
            Explore features ↓
          </a>
        </div>

        {/* Hero Interactive Mockup Showcase */}
        <div className="mt-14 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-2xl backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">client-portal.preview/meridian-studio</span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
              ● Ready for Review
            </span>
          </div>
          <div className="p-6 text-left grid gap-4 sm:grid-cols-3 bg-slate-950/80 rounded-xl mt-3">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
              <span className="text-xs font-bold text-indigo-400">01. Choose Aesthetic</span>
              <p className="text-xs text-slate-400 mt-1">Modern Corporate, Minimal Studio, or Bold Creative.</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
              <span className="text-xs font-bold text-indigo-400">02. Add Visuals with '+'</span>
              <p className="text-xs text-slate-400 mt-1">Drop real project mockups, avatars, and custom logos.</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
              <span className="text-xs font-bold text-indigo-400">03. Send Private Link</span>
              <p className="text-xs text-slate-400 mt-1">No client login needed. 1-click Approve or Request Changes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Bento features ---------- */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-wider text-indigo-400">
            Platform Capabilities
          </span>
          <h2 className="text-2xl font-bold text-white sm:text-4xl">
            Built for modern designers &amp; demanding clients
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {BENTO_FEATURES.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xs transition-all hover:border-indigo-500/40 hover:bg-slate-900/80"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-xl border border-indigo-500/20">
                {item.icon}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                {item.tag}
              </span>
              <h3 className="mt-1 mb-2 text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20 border-t border-slate-900">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-wider text-indigo-400">
            Simple Pricing
          </span>
          <h2 className="text-2xl font-bold text-white sm:text-4xl">
            Transparent plans for solo freelancers and studios
          </h2>
          <p className="mx-auto mt-3 max-w-md text-xs text-slate-400">
            Every plan includes client comments and approvals. Public shareable client links on Pro.
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
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-8 py-16 text-center shadow-2xl">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-40 w-96 rounded-full bg-indigo-500/20 blur-[90px]" />
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to wow your clients on the very first review?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-xs text-slate-400">
            Set up your first interactive prototype in less than 2 minutes.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-slate-900 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <span className="h-5 w-5 rounded bg-indigo-600 flex items-center justify-center text-[10px] text-white">✦</span>
            DesignStudio
          </div>
          <p>© {new Date().getFullYear()} DesignStudio. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
