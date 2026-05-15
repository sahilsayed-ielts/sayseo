-- Add date metadata and source to GA4 runs (mirrors qi_upload_schema)
alter table public.ga4_intel_runs
  add column if not exists date_from text,
  add column if not exists date_to   text,
  add column if not exists source    text not null default 'api';
