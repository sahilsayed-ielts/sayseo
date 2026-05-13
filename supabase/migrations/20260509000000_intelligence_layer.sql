-- Intelligence Layer: visibility scores, fix list, content gaps, schema audits, competitors
-- Note: all tables reference connected_sites (the real parent table), not "sites"

-- ── visibility_scores ──────────────────────────────────────────────────────────
create table public.visibility_scores (
  id            uuid primary key default gen_random_uuid(),
  site_id       uuid not null references public.connected_sites(id) on delete cascade,
  score         integer not null,
  module1_score integer,
  module2_score integer,
  module3_score integer,
  score_change  integer not null default 0,
  calculated_at timestamptz not null default now()
);

-- ── fix_list ───────────────────────────────────────────────────────────────────
create table public.fix_list (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references public.connected_sites(id) on delete cascade,
  fix_text   text not null,
  impact     text check (impact in ('High', 'Medium', 'Low')),
  category   text check (category in ('Technical', 'Content', 'Schema')),
  detail     text,
  created_at timestamptz not null default now()
);

-- ── content_gaps ───────────────────────────────────────────────────────────────
create table public.content_gaps (
  id                uuid primary key default gen_random_uuid(),
  site_id           uuid not null references public.connected_sites(id) on delete cascade,
  topic             text not null,
  ai_platforms      text[],
  opportunity_score integer,
  suggested_title   text,
  created_at        timestamptz not null default now()
);

-- ── schema_audits ──────────────────────────────────────────────────────────────
create table public.schema_audits (
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid not null references public.connected_sites(id) on delete cascade,
  page_url         text not null,
  schemas_present  text[],
  schemas_missing  text[],
  suggested_schema jsonb,
  created_at       timestamptz not null default now()
);

-- ── competitor_sites ───────────────────────────────────────────────────────────
create table public.competitor_sites (
  id                uuid primary key default gen_random_uuid(),
  site_id           uuid not null references public.connected_sites(id) on delete cascade,
  competitor_domain text not null,
  last_checked      timestamptz,
  unique(site_id, competitor_domain)
);

-- ── competitor_scores ──────────────────────────────────────────────────────────
create table public.competitor_scores (
  id                 uuid primary key default gen_random_uuid(),
  competitor_site_id uuid not null references public.competitor_sites(id) on delete cascade,
  ai_score           integer,
  citation_rate      numeric,
  aio_rate           numeric,
  checked_at         timestamptz not null default now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
create index on public.visibility_scores(site_id, calculated_at desc);
create index on public.fix_list(site_id, created_at desc);
create index on public.content_gaps(site_id, created_at desc);
create index on public.schema_audits(site_id, created_at desc);
create index on public.competitor_sites(site_id);
create index on public.competitor_scores(competitor_site_id, checked_at desc);

-- ── Row Level Security ─────────────────────────────────────────────────────────
alter table public.visibility_scores enable row level security;
alter table public.fix_list          enable row level security;
alter table public.content_gaps      enable row level security;
alter table public.schema_audits     enable row level security;
alter table public.competitor_sites  enable row level security;
alter table public.competitor_scores enable row level security;

-- Helper macro: ownership via connected_sites
-- visibility_scores
create policy "users can select own visibility_scores"
  on public.visibility_scores for select using (
    exists (select 1 from public.connected_sites cs
            where cs.id = visibility_scores.site_id and cs.user_id = auth.uid()));

create policy "users can insert own visibility_scores"
  on public.visibility_scores for insert with check (
    exists (select 1 from public.connected_sites cs
            where cs.id = visibility_scores.site_id and cs.user_id = auth.uid()));

-- fix_list
create policy "users can select own fix_list"
  on public.fix_list for select using (
    exists (select 1 from public.connected_sites cs
            where cs.id = fix_list.site_id and cs.user_id = auth.uid()));

create policy "users can insert own fix_list"
  on public.fix_list for insert with check (
    exists (select 1 from public.connected_sites cs
            where cs.id = fix_list.site_id and cs.user_id = auth.uid()));

create policy "users can delete own fix_list"
  on public.fix_list for delete using (
    exists (select 1 from public.connected_sites cs
            where cs.id = fix_list.site_id and cs.user_id = auth.uid()));

-- content_gaps
create policy "users can select own content_gaps"
  on public.content_gaps for select using (
    exists (select 1 from public.connected_sites cs
            where cs.id = content_gaps.site_id and cs.user_id = auth.uid()));

create policy "users can insert own content_gaps"
  on public.content_gaps for insert with check (
    exists (select 1 from public.connected_sites cs
            where cs.id = content_gaps.site_id and cs.user_id = auth.uid()));

create policy "users can delete own content_gaps"
  on public.content_gaps for delete using (
    exists (select 1 from public.connected_sites cs
            where cs.id = content_gaps.site_id and cs.user_id = auth.uid()));

-- schema_audits
create policy "users can select own schema_audits"
  on public.schema_audits for select using (
    exists (select 1 from public.connected_sites cs
            where cs.id = schema_audits.site_id and cs.user_id = auth.uid()));

create policy "users can insert own schema_audits"
  on public.schema_audits for insert with check (
    exists (select 1 from public.connected_sites cs
            where cs.id = schema_audits.site_id and cs.user_id = auth.uid()));

create policy "users can delete own schema_audits"
  on public.schema_audits for delete using (
    exists (select 1 from public.connected_sites cs
            where cs.id = schema_audits.site_id and cs.user_id = auth.uid()));

-- competitor_sites
create policy "users can select own competitor_sites"
  on public.competitor_sites for select using (
    exists (select 1 from public.connected_sites cs
            where cs.id = competitor_sites.site_id and cs.user_id = auth.uid()));

create policy "users can insert own competitor_sites"
  on public.competitor_sites for insert with check (
    exists (select 1 from public.connected_sites cs
            where cs.id = competitor_sites.site_id and cs.user_id = auth.uid()));

create policy "users can update own competitor_sites"
  on public.competitor_sites for update using (
    exists (select 1 from public.connected_sites cs
            where cs.id = competitor_sites.site_id and cs.user_id = auth.uid()));

create policy "users can delete own competitor_sites"
  on public.competitor_sites for delete using (
    exists (select 1 from public.connected_sites cs
            where cs.id = competitor_sites.site_id and cs.user_id = auth.uid()));

-- competitor_scores (ownership traverses competitor_sites → connected_sites)
create policy "users can select own competitor_scores"
  on public.competitor_scores for select using (
    exists (
      select 1 from public.competitor_sites cmp
      join public.connected_sites cs on cs.id = cmp.site_id
      where cmp.id = competitor_scores.competitor_site_id and cs.user_id = auth.uid()));

create policy "users can insert own competitor_scores"
  on public.competitor_scores for insert with check (
    exists (
      select 1 from public.competitor_sites cmp
      join public.connected_sites cs on cs.id = cmp.site_id
      where cmp.id = competitor_scores.competitor_site_id and cs.user_id = auth.uid()));
