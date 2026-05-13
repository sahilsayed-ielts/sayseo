alter table public.connected_sites
  add column if not exists connection_type text default 'manual',
  add column if not exists access_token text,
  add column if not exists refresh_token text,
  add column if not exists token_expiry timestamptz;

create unique index if not exists oauth_tokens_site_provider_key
  on public.oauth_tokens(site_id, provider);

create index if not exists connected_sites_user_token_expiry_idx
  on public.connected_sites(user_id, token_expiry desc)
  where access_token is not null;
