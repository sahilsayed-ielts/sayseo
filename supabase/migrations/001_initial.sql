-- SaySEO initial schema

-- connected_sites: one row per domain a user connects
create table public.connected_sites (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  domain         text not null,
  ga4_property_id text,
  gsc_site_url   text,
  created_at     timestamptz not null default now(),
  last_synced    timestamptz
);

-- oauth_tokens: GA4 / GSC tokens per connected site
create table public.oauth_tokens (
  id            uuid primary key default gen_random_uuid(),
  site_id       uuid not null references public.connected_sites(id) on delete cascade,
  provider      text not null check (provider in ('ga4', 'gsc')),
  access_token  text not null,
  refresh_token text,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- report_cache: cached API report payloads per site
create table public.report_cache (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.connected_sites(id) on delete cascade,
  report_type text not null,
  date_range  text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);

-- Indexes
create index on public.connected_sites(user_id);
create index on public.oauth_tokens(site_id);
create index on public.report_cache(site_id, report_type, date_range);
create index on public.report_cache(expires_at);

-- Enable Row Level Security
alter table public.connected_sites enable row level security;
alter table public.oauth_tokens    enable row level security;
alter table public.report_cache    enable row level security;

-- RLS policies: connected_sites — users own their rows
create policy "users can select their own sites"
  on public.connected_sites for select
  using (auth.uid() = user_id);

create policy "users can insert their own sites"
  on public.connected_sites for insert
  with check (auth.uid() = user_id);

create policy "users can update their own sites"
  on public.connected_sites for update
  using (auth.uid() = user_id);

create policy "users can delete their own sites"
  on public.connected_sites for delete
  using (auth.uid() = user_id);

-- RLS policies: oauth_tokens — via site ownership
create policy "users can select tokens for their sites"
  on public.oauth_tokens for select
  using (
    exists (
      select 1 from public.connected_sites s
      where s.id = site_id and s.user_id = auth.uid()
    )
  );

create policy "users can insert tokens for their sites"
  on public.oauth_tokens for insert
  with check (
    exists (
      select 1 from public.connected_sites s
      where s.id = site_id and s.user_id = auth.uid()
    )
  );

create policy "users can update tokens for their sites"
  on public.oauth_tokens for update
  using (
    exists (
      select 1 from public.connected_sites s
      where s.id = site_id and s.user_id = auth.uid()
    )
  );

create policy "users can delete tokens for their sites"
  on public.oauth_tokens for delete
  using (
    exists (
      select 1 from public.connected_sites s
      where s.id = site_id and s.user_id = auth.uid()
    )
  );

-- RLS policies: report_cache — via site ownership
create policy "users can select cache for their sites"
  on public.report_cache for select
  using (
    exists (
      select 1 from public.connected_sites s
      where s.id = site_id and s.user_id = auth.uid()
    )
  );

create policy "users can insert cache for their sites"
  on public.report_cache for insert
  with check (
    exists (
      select 1 from public.connected_sites s
      where s.id = site_id and s.user_id = auth.uid()
    )
  );

create policy "users can update cache for their sites"
  on public.report_cache for update
  using (
    exists (
      select 1 from public.connected_sites s
      where s.id = site_id and s.user_id = auth.uid()
    )
  );

create policy "users can delete cache for their sites"
  on public.report_cache for delete
  using (
    exists (
      select 1 from public.connected_sites s
      where s.id = site_id and s.user_id = auth.uid()
    )
  );
