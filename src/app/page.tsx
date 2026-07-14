import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Database,
  LockKeyhole,
  MessageSquareText,
  Sparkles,
  Store,
} from "lucide-react";
import GitHubIcon from "@/components/GitHubIcon";

const features = [
  {
    icon: MessageSquareText,
    title: "Catalog-aware AI assistant",
    description:
      "Ask anything about your products. Questions are embedded with Gemini and matched against your catalog using pgvector cosine search, so answers are grounded in your real data — never invented.",
  },
  {
    icon: Sparkles,
    title: "AI product descriptions",
    description:
      "Generate on-brand product copy in four tones from a title, category, and a few keywords, or let the AI improve the description you already have.",
  },
  {
    icon: BarChart3,
    title: "Sales dashboard",
    description:
      "Revenue trend, order volume, average order value, and top products — computed live from your orders with a clean, readable chart.",
  },
  {
    icon: LockKeyhole,
    title: "Multi-tenant by design",
    description:
      "Every table is protected by Postgres Row Level Security. Your API routes never leak another merchant's data — the database enforces it.",
  },
  {
    icon: Store,
    title: "One-click demo store",
    description:
      "Seed a complete outdoor-gear store — 16 products and 60 days of order history — and explore every feature in under a minute.",
  },
  {
    icon: Database,
    title: "Free-tier friendly",
    description:
      "Runs entirely on free tiers: Supabase (Postgres, Auth, pgvector), Google Gemini, and Vercel. No credit card needed to self-host.",
  },
];

const stack = [
  "Next.js 16 (App Router)",
  "TypeScript",
  "Supabase Postgres + Auth",
  "pgvector",
  "Gemini 3.5 Flash",
  "Tailwind CSS v4",
  "Recharts",
  "Vercel",
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Nav */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="h-6 w-6 text-accent" aria-hidden />
            Storefront Copilot
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="https://github.com/PerfectoCayabyab/storefront-copilot"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground sm:flex"
            >
              <GitHubIcon className="h-4 w-4" />
              Source
            </a>
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
        <p className="mx-auto mb-6 w-fit rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-muted">
          Open-source portfolio project — built with Next.js, Supabase &amp; Gemini
        </p>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          Your store&rsquo;s catalog, with an{" "}
          <span className="text-accent">AI copilot</span> on top
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted">
          Storefront Copilot gives merchants a catalog-aware AI assistant,
          one-click product copywriting, and a live sales dashboard — multi-tenant,
          secured with Row Level Security, and deployable on free tiers.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-white hover:bg-accent-strong"
          >
            Try it with a demo store
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href="https://github.com/PerfectoCayabyab/storefront-copilot"
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 font-medium hover:bg-surface-muted"
          >
            <GitHubIcon className="h-4 w-4" />
            View the code
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold">
            Everything a small store needs from AI
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-background p-6"
              >
                <div className="mb-4 w-fit rounded-xl bg-accent-soft p-2.5">
                  <Icon className="h-5 w-5 text-accent" aria-hidden />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold">Built on a modern, free stack</h2>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {stack.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
          <p>
            Built by{" "}
            <a
              href="https://perfectocayabyab.com/"
              target="_blank"
              className="text-foreground underline underline-offset-4"
            >
              Perfecto II Cayabyab
            </a>{" "}
            as a full-stack portfolio project.
          </p>
          <a
            href="https://github.com/PerfectoCayabyab/storefront-copilot"
            target="_blank"
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
