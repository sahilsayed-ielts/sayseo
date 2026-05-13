-- Module 3: AI Overview Tracker tables

create table public.aio_checks (
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid not null references public.connected_sites(id) on delete cascade,
  query            text not null,
  aio_triggered    boolean not null default false,
  domain_cited     boolean not null default false,
  citation_position int,
  citation_url     text,
  checked_at       timestamptz not null default now()
);

create table public.aio_summary (
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid not null references public.connected_sites(id) on delete cascade unique,
  queries_checked  int not null default 0,
  aio_triggers     int not null default 0,
  domain_citations int not null default 0,
  last_checked     timestamptz,
  updated_at       timestamptz not null default now()
);

create index on public.aio_checks(site_id, checked_at desc);
create index on public.aio_summary(site_id);

alter table public.aio_checks  enable row level security;
alter table public.aio_summary enable row level security;

-- aio_checks policies
create policy "users can select own aio_checks"
  on public.aio_checks for select
  using (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = aio_checks.site_id and cs.user_id = auth.uid()
    )
  );

create policy "users can insert own aio_checks"
  on public.aio_checks for insert
  with check (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = aio_checks.site_id and cs.user_id = auth.uid()
    )
  );

-- aio_summary policies
create policy "users can select own aio_summary"
  on public.aio_summary for select
  using (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = aio_summary.site_id and cs.user_id = auth.uid()
    )
  );

create policy "users can insert own aio_summary"
  on public.aio_summary for insert
  with check (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = aio_summary.site_id and cs.user_id = auth.uid()
    )
  );

create policy "users can update own aio_summary"
  on public.aio_summary for update
  using (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = aio_summary.site_id and cs.user_id = auth.uid()
    )
  );
