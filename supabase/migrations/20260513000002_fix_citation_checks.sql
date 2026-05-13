-- Fix citation_checks: expand platform CHECK constraint, add unique + update policy

-- 1. Drop the restrictive CHECK that only permitted 'claude'
alter table public.citation_checks
  drop constraint if exists citation_checks_platform_check;

-- 2. Add new CHECK allowing all three platforms
alter table public.citation_checks
  add constraint citation_checks_platform_check
  check (platform in ('claude', 'chatgpt', 'gemini'));

-- 3. Add UNIQUE constraint so the upsert conflict target works
alter table public.citation_checks
  add constraint citation_checks_site_query_platform_key
  unique (site_id, query, platform);

-- 4. Add missing UPDATE policy (needed for upsert ON CONFLICT DO UPDATE)
create policy "users can update own citation_checks"
  on public.citation_checks for update
  using (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = citation_checks.site_id
        and cs.user_id = auth.uid()
    )
  );
