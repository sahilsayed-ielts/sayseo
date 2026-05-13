-- AIO Opportunities: stores Claude-generated page recommendations per site

create table public.aio_opportunities (
  id              uuid primary key default gen_random_uuid(),
  site_id         uuid not null references public.connected_sites(id) on delete cascade,
  query_pattern   text not null,
  page_type       text,
  aio_likelihood  text check (aio_likelihood in ('High', 'Medium')),
  suggested_slug  text,
  suggested_title text,
  created_at      timestamptz not null default now()
);

create index on public.aio_opportunities(site_id, created_at desc);

alter table public.aio_opportunities enable row level security;

create policy "users can select own aio_opportunities"
  on public.aio_opportunities for select using (
    exists (select 1 from public.connected_sites cs
            where cs.id = aio_opportunities.site_id and cs.user_id = auth.uid()));

create policy "users can insert own aio_opportunities"
  on public.aio_opportunities for insert with check (
    exists (select 1 from public.connected_sites cs
            where cs.id = aio_opportunities.site_id and cs.user_id = auth.uid()));

create policy "users can delete own aio_opportunities"
  on public.aio_opportunities for delete using (
    exists (select 1 from public.connected_sites cs
            where cs.id = aio_opportunities.site_id and cs.user_id = auth.uid()));
