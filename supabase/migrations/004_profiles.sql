-- profiles: per-user metadata and onboarding state

create table public.profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  domain              text,
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index on public.profiles(user_id);

alter table public.profiles enable row level security;

create policy "users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Auto-create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
