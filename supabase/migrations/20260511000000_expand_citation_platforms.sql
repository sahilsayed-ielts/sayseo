-- Expand citation_checks to support ChatGPT and Gemini alongside Claude

-- Drop the claude-only check constraint
alter table public.citation_checks drop constraint citation_checks_platform_check;

-- Allow all 3 platforms
alter table public.citation_checks add constraint citation_checks_platform_check
  check (platform in ('claude', 'chatgpt', 'gemini'));

-- Add unique constraint so upsert on (site_id, query, platform) works
alter table public.citation_checks add constraint citation_checks_site_query_platform_key
  unique (site_id, query, platform);

-- Update policy needed for upsert
create policy "users can update own citation_checks"
  on public.citation_checks for update
  using (
    exists (
      select 1 from public.connected_sites cs
      where cs.id = citation_checks.site_id
        and cs.user_id = auth.uid()
    )
  );
