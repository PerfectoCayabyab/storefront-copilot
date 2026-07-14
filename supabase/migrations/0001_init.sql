-- Storefront Copilot — initial schema
-- Run this in the Supabase SQL Editor (or `supabase db push`).

create extension if not exists vector;

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  title text not null,
  description text not null default '',
  price numeric(10, 2) not null default 0,
  inventory integer not null default 0,
  category text not null default '',
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_store_id_idx on public.products (store_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  customer_name text not null default '',
  total numeric(10, 2) not null default 0,
  status text not null default 'paid' check (status in ('pending', 'paid', 'fulfilled', 'refunded')),
  placed_at timestamptz not null default now()
);

create index orders_store_id_idx on public.orders (store_id);
create index orders_placed_at_idx on public.orders (placed_at);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_title text not null default '',
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null default 0
);

create index order_items_order_id_idx on public.order_items (order_id);

-- One embedding per product, scoped to a store for fast per-tenant search.
create table public.product_embeddings (
  product_id uuid primary key references public.products (id) on delete cascade,
  store_id uuid not null references public.stores (id) on delete cascade,
  content text not null,
  embedding vector(768) not null,
  updated_at timestamptz not null default now()
);

create index product_embeddings_store_id_idx on public.product_embeddings (store_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────
-- Every table is tenant-scoped: a user can only touch rows belonging to a
-- store they own. The API relies on these policies instead of manual checks.

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_embeddings enable row level security;

create policy "Owners manage their stores"
  on public.stores for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners manage their products"
  on public.products for all
  using (store_id in (select id from public.stores where owner_id = (select auth.uid())))
  with check (store_id in (select id from public.stores where owner_id = (select auth.uid())));

create policy "Owners manage their orders"
  on public.orders for all
  using (store_id in (select id from public.stores where owner_id = (select auth.uid())))
  with check (store_id in (select id from public.stores where owner_id = (select auth.uid())));

create policy "Owners manage their order items"
  on public.order_items for all
  using (order_id in (
    select o.id from public.orders o
    join public.stores s on s.id = o.store_id
    where s.owner_id = (select auth.uid())
  ))
  with check (order_id in (
    select o.id from public.orders o
    join public.stores s on s.id = o.store_id
    where s.owner_id = (select auth.uid())
  ));

create policy "Owners manage their product embeddings"
  on public.product_embeddings for all
  using (store_id in (select id from public.stores where owner_id = (select auth.uid())))
  with check (store_id in (select id from public.stores where owner_id = (select auth.uid())));

-- ─── Triggers ────────────────────────────────────────────────────────────────

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ─── Vector search ───────────────────────────────────────────────────────────
-- Cosine similarity search over a single store's catalog. SECURITY INVOKER
-- (the default), so RLS still applies to the caller.

create function public.match_products(
  p_store_id uuid,
  query_embedding vector(768),
  match_count int default 6
)
returns table (
  product_id uuid,
  title text,
  description text,
  price numeric,
  inventory integer,
  category text,
  status text,
  similarity double precision
)
language sql
stable
as $$
  select
    p.id,
    p.title,
    p.description,
    p.price,
    p.inventory,
    p.category,
    p.status,
    1 - (pe.embedding <=> query_embedding) as similarity
  from public.product_embeddings pe
  join public.products p on p.id = pe.product_id
  where pe.store_id = p_store_id
  order by pe.embedding <=> query_embedding
  limit match_count;
$$;
