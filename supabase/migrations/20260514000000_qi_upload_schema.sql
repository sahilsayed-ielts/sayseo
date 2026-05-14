-- Extend QI tables for CSV-upload-based flow

-- Add date metadata and source to runs
alter table public.query_intelligence_runs
  add column if not exists date_from    text,
  add column if not exists date_to      text,
  add column if not exists compare_from text,
  add column if not exists compare_to   text,
  add column if not exists source       text not null default 'api';

-- Allow query/page to be null (upload flow: queries CSV has no page col, pages CSV has no query col)
alter table public.query_intelligence_results
  alter column query drop not null,
  alter column page  drop not null;

-- Add row type discriminator and comparison-period columns
alter table public.query_intelligence_results
  add column if not exists row_type         text not null default 'query',
  add column if not exists prev_clicks      int,
  add column if not exists prev_impressions int,
  add column if not exists prev_ctr         numeric,
  add column if not exists prev_position    numeric;
