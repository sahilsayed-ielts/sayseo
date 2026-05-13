-- GA4 Intel module tables

create table public.ga4_intel_runs (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.connected_sites(id) on delete cascade,
  fetched_at  timestamptz not null default now(),
  date_range  text not null default 'last90days',
  row_count   int,
  status      text check (status in ('pending', 'complete', 'error')) default 'pending'
);

create table public.ga4_intel_pages (
  id                  uuid primary key default gen_random_uuid(),
  run_id              uuid not null references public.ga4_intel_runs(id) on delete cascade,
  site_id             uuid not null references public.connected_sites(id) on delete cascade,
  page_path           text not null,
  sessions            int,
  engaged_sessions    int,
  bounce_rate         numeric,
  avg_engagement_time numeric,
  conversions         int,
  channel             text,
  created_at          timestamptz not null default now()
);

create table public.ga4_intel_analyses (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references public.ga4_intel_runs(id) on delete cascade,
  site_id       uuid not null references public.connected_sites(id) on delete cascade,
  analysis_json jsonb not null,
  created_at    timestamptz not null default now()
);

-- Indexes
create index on public.ga4_intel_runs(site_id);
create index on public.ga4_intel_pages(run_id);
create index on public.ga4_intel_pages(site_id);
create index on public.ga4_intel_analyses(run_id);
create index on public.ga4_intel_analyses(site_id);

-- RLS
alter table public.ga4_intel_runs      enable row level security;
alter table public.ga4_intel_pages     enable row level security;
alter table public.ga4_intel_analyses  enable row level security;

-- ga4_intel_runs
create policy "users can select own ga4_intel_runs"
  on public.ga4_intel_runs for select
  using (exists (select 1 from public.connected_sites cs where cs.id = ga4_intel_runs.site_id and cs.user_id = auth.uid()));

create policy "users can insert own ga4_intel_runs"
  on public.ga4_intel_runs for insert
  with check (exists (select 1 from public.connected_sites cs where cs.id = ga4_intel_runs.site_id and cs.user_id = auth.uid()));

create policy "users can update own ga4_intel_runs"
  on public.ga4_intel_runs for update
  using (exists (select 1 from public.connected_sites cs where cs.id = ga4_intel_runs.site_id and cs.user_id = auth.uid()));

-- ga4_intel_pages
create policy "users can select own ga4_intel_pages"
  on public.ga4_intel_pages for select
  using (exists (select 1 from public.connected_sites cs where cs.id = ga4_intel_pages.site_id and cs.user_id = auth.uid()));

create policy "users can insert own ga4_intel_pages"
  on public.ga4_intel_pages for insert
  with check (exists (select 1 from public.connected_sites cs where cs.id = ga4_intel_pages.site_id and cs.user_id = auth.uid()));

-- ga4_intel_analyses
create policy "users can select own ga4_intel_analyses"
  on public.ga4_intel_analyses for select
  using (exists (select 1 from public.connected_sites cs where cs.id = ga4_intel_analyses.site_id and cs.user_id = auth.uid()));

create policy "users can insert own ga4_intel_analyses"
  on public.ga4_intel_analyses for insert
  with check (exists (select 1 from public.connected_sites cs where cs.id = ga4_intel_analyses.site_id and cs.user_id = auth.uid()));
