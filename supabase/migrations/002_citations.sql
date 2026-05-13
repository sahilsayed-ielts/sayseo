-- Module 2: Citation Monitor tables

-- citation_checks: one row per query checked per run
create table public.citation_checks (
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid not null references public.connected_sites(id) on delete cascade,
  query            text not null,
  platform         text not null check (platform in ('claude')),
  response_snippet text,
  domain_mentioned boolean not null default false,
  checked_at       timestamptz not null default now()
);

-- citation_summary: aggregated totals per site + platform
create table public.citation_summary (
  id            uuid primary key default gen_random_uuid(),
  site_id       uuid not null references public.connected_sites(id) on delete cascade,
  platform      text not null,
  mention_count integer not null default 0,
  total_checks  integer not null default 0,
  last_checked  timestamptz not null default now(),
  unique(site_id, platform)
);

-- Indexes
create index on public.citation_checks(site_id, checked_at desc);
create index on public.citation_summary(site_id);

-- Row Level Security
alter table public.citation_checks  enable row level security;
alter table public.citation_summary enable row level security;

-- citation_checks policies (ownership via connected_sites)
create policy "users can select own citation_checks"
  on public.citation_checks for select
  using (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = citation_checks.site_id
        and cs.user_id = auth.uid()
    )
  );

create policy "users can insert own citation_checks"
  on public.citation_checks for insert
  with check (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = citation_checks.site_id
        and cs.user_id = auth.uid()
    )
  );

-- citation_summary policies
create policy "users can select own citation_summary"
  on public.citation_summary for select
  using (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = citation_summary.site_id
        and cs.user_id = auth.uid()
    )
  );

create policy "users can insert own citation_summary"
  on public.citation_summary for insert
  with check (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = citation_summary.site_id
        and cs.user_id = auth.uid()
    )
  );

create policy "users can update own citation_summary"
  on public.citation_summary for update
  using (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = citation_summary.site_id
        and cs.user_id = auth.uid()
    )
  );
