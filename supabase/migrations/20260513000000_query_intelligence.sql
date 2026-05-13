-- Query Intelligence module

create table public.query_intelligence_runs (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.connected_sites(id) on delete cascade,
  fetched_at  timestamptz not null default now(),
  date_range  text not null default 'last28days',
  row_count   int,
  status      text check (status in ('pending', 'complete', 'error')) default 'pending'
);

create table public.query_intelligence_results (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references public.query_intelligence_runs(id) on delete cascade,
  site_id     uuid not null references public.connected_sites(id) on delete cascade,
  query       text not null,
  page        text not null,
  clicks      int,
  impressions int,
  ctr         numeric,
  position    numeric,
  created_at  timestamptz not null default now()
);

create table public.query_intelligence_analyses (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references public.query_intelligence_runs(id) on delete cascade,
  site_id       uuid not null references public.connected_sites(id) on delete cascade,
  analysis_json jsonb not null,
  created_at    timestamptz not null default now()
);

create index on public.query_intelligence_runs(site_id);
create index on public.query_intelligence_results(site_id);
create index on public.query_intelligence_results(run_id);
create index on public.query_intelligence_analyses(site_id);
create index on public.query_intelligence_analyses(run_id);

alter table public.query_intelligence_runs     enable row level security;
alter table public.query_intelligence_results  enable row level security;
alter table public.query_intelligence_analyses enable row level security;

-- query_intelligence_runs policies
create policy "users can select own qi_runs"
  on public.query_intelligence_runs for select
  using (exists (
    select 1 from public.connected_sites cs
    where cs.id = query_intelligence_runs.site_id and cs.user_id = auth.uid()
  ));

create policy "users can insert own qi_runs"
  on public.query_intelligence_runs for insert
  with check (exists (
    select 1 from public.connected_sites cs
    where cs.id = query_intelligence_runs.site_id and cs.user_id = auth.uid()
  ));

create policy "users can update own qi_runs"
  on public.query_intelligence_runs for update
  using (exists (
    select 1 from public.connected_sites cs
    where cs.id = query_intelligence_runs.site_id and cs.user_id = auth.uid()
  ));

-- query_intelligence_results policies
create policy "users can select own qi_results"
  on public.query_intelligence_results for select
  using (exists (
    select 1 from public.connected_sites cs
    where cs.id = query_intelligence_results.site_id and cs.user_id = auth.uid()
  ));

create policy "users can insert own qi_results"
  on public.query_intelligence_results for insert
  with check (exists (
    select 1 from public.connected_sites cs
    where cs.id = query_intelligence_results.site_id and cs.user_id = auth.uid()
  ));

-- query_intelligence_analyses policies
create policy "users can select own qi_analyses"
  on public.query_intelligence_analyses for select
  using (exists (
    select 1 from public.connected_sites cs
    where cs.id = query_intelligence_analyses.site_id and cs.user_id = auth.uid()
  ));

create policy "users can insert own qi_analyses"
  on public.query_intelligence_analyses for insert
  with check (exists (
    select 1 from public.connected_sites cs
    where cs.id = query_intelligence_analyses.site_id and cs.user_id = auth.uid()
  ));

create policy "users can update own qi_analyses"
  on public.query_intelligence_analyses for update
  using (exists (
    select 1 from public.connected_sites cs
    where cs.id = query_intelligence_analyses.site_id and cs.user_id = auth.uid()
  ));
