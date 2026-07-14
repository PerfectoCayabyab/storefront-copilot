# Storefront Copilot

An AI toolkit for e-commerce merchants: a **catalog-aware AI assistant (RAG)**, **AI product copywriting**, and a **live sales dashboard** — multi-tenant, secured with Postgres Row Level Security, and deployable entirely on free tiers.

Built as a full-stack portfolio project by [Perfecto II Cayabyab](https://perfectocayabyab.com/).

## Features

- **Auth & multi-tenancy** — Supabase email/password auth; every table is protected by Row Level Security, so tenant isolation is enforced by the database, not just the API.
- **One-click demo store** — seeds 16 products and 60 days of deterministic order history so reviewers can explore everything in under a minute.
- **AI product descriptions** — Gemini 3.5 Flash generates or improves product copy in four tones from title, category, and keywords.
- **Catalog Q&A assistant (RAG)** — questions are embedded with `gemini-embedding-001` (768 dims), matched against the store's catalog via pgvector cosine search, and answered with streaming responses grounded in the retrieved products.
- **Sales dashboard** — 30-day revenue trend chart, stat tiles (revenue, orders, AOV, products), top products by revenue, and recent orders.
- **Products CRUD** — with automatic vector re-indexing on create/update and cascade cleanup on delete.

## Architecture

```
Browser ──► Next.js 16 (App Router, TypeScript, Tailwind v4)
              │
              ├── proxy.ts ────────────── session refresh + route protection
              │
              ├── Server Components ───── dashboard reads (RLS-scoped)
              │
              └── Route Handlers (REST)
                    ├── /api/stores            create store / seed demo
                    ├── /api/products[/:id]    CRUD + embedding sync
                    ├── /api/ai/describe       product copywriting
                    ├── /api/ai/chat           RAG chat (streaming)
                    └── /api/ai/sync           rebuild vector index
                          │                        │
                          ▼                        ▼
                   Google Gemini API        Supabase Postgres
                   (chat + embeddings)      (Auth, RLS, pgvector)
```

**RAG flow:** product saved → embed `title + category + price + description` → upsert into `product_embeddings (vector(768))`. On a question → embed the query → `match_products()` SQL function (cosine, per-store) → top matches injected into the Gemini system prompt → streamed answer.

## Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 16 (App Router) · React 19 · TypeScript   |
| Database   | Supabase Postgres + pgvector, Row Level Security  |
| Auth       | Supabase Auth (`@supabase/ssr`)                   |
| AI         | Gemini 3.5 Flash + gemini-embedding-001 (free tier) |
| Styling    | Tailwind CSS v4                                   |
| Charts     | Recharts                                          |
| Hosting    | Vercel (free tier)                                |

## Getting started

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) (creates tables, RLS policies, and the `match_products` vector-search function).
3. For a friction-free demo, disable **Authentication → Sign In / Up → Email → Confirm email** (optional — with it enabled, users must confirm before signing in).

### 2. Gemini API key

Create a free API key at [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `GEMINI_API_KEY` | Google AI Studio |

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and click **Create demo store**.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the three environment variables from `.env.local`.
4. Deploy — no other configuration needed.

## Project structure

```
supabase/migrations/     SQL schema, RLS policies, vector search function
src/
  proxy.ts               Auth session refresh + protected routes (Next 16)
  lib/
    supabase/            Browser/server Supabase clients (@supabase/ssr)
    gemini.ts            Gemini client, models, embedding helpers
    embeddings.ts        Batch product embedding sync
    demo-data.ts         Demo catalog + deterministic order history
    store.ts             requireStore() server guard
  app/
    api/                 REST route handlers (stores, products, ai/*)
    dashboard/           Overview, products CRUD, AI assistant, settings
    login|signup|onboarding/
  components/            UI components (forms, chat, chart, tables)
```

## Keep-alive (important on the free tier)

Supabase free projects auto-pause after ~7 days without activity — a paused demo is a dead demo. This repo ships [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml), which pings the database twice a week (Mon/Thu). After pushing to GitHub:

1. Repo → **Settings → Secrets and variables → Actions → Secrets**: add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
2. Optionally add the **Variable** `KEEP_ALIVE_URL` (your Vercel URL) so the workflow also hits the app's `/api/health` endpoint.
3. Actions tab → run **Keep Supabase awake** once manually to confirm it's green.

GitHub disables scheduled workflows after ~60 days of repo inactivity; any commit (or re-enabling in the Actions tab) revives it.

## Free-tier notes

- **Supabase**: 500 MB database — far more than this app needs.
- **Gemini**: free-tier rate limits apply; embedding requests are batched (50/call) to stay well inside them.
- The app degrades gracefully without a Gemini key: CRUD and the dashboard work, and AI features surface a clear "rebuild index from Settings" message once a key is added.
