create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar_url text,
  plan_tier text not null default 'professional',
  plan_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_plan_tier_check' and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_plan_tier_check check (plan_tier in ('professional', 'enterprise'));
  end if;
end $$;

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null default 'Untitled code',
  kind text not null default 'url',
  content jsonb not null default '{}'::jsonb,
  style jsonb not null default '{}'::jsonb,
  is_dynamic boolean not null default false,
  slug text unique,
  target_url text,
  password_hash text,
  expires_at timestamptz,
  redirect_rules jsonb,
  scan_count integer not null default 0,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qr_scans (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.qr_codes(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  device text,
  country text,
  referrer text
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  page text not null default '/',
  device text,
  country text,
  referrer text,
  visit_date date not null default current_date,
  visited_at timestamptz not null default now(),
  unique (visitor_id, visit_date)
);

create table if not exists public.upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_tier text not null default 'enterprise',
  status text not null default 'pending',
  amount integer not null default 0,
  currency text not null default 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  term text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create index if not exists qr_codes_user_id_idx on public.qr_codes (user_id, created_at desc);
create index if not exists qr_codes_user_favorite_idx on public.qr_codes (user_id, favorite desc);
create index if not exists qr_scans_code_id_idx on public.qr_scans (code_id, scanned_at desc);
create index if not exists visits_visited_at_idx on public.visits (visited_at desc);
create index if not exists upgrade_requests_user_id_idx on public.upgrade_requests (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists qr_codes_updated_at on public.qr_codes;
create trigger qr_codes_updated_at before update on public.qr_codes
  for each row execute function public.set_updated_at();

drop trigger if exists upgrade_requests_updated_at on public.upgrade_requests;
create trigger upgrade_requests_updated_at before update on public.upgrade_requests
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.qr_codes enable row level security;
alter table public.qr_scans enable row level security;
alter table public.visits enable row level security;
alter table public.upgrade_requests enable row level security;
alter table public.admins enable row level security;

revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
drop policy if exists profiles_own_all on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated
  using (auth.uid() = id);

revoke all on public.qr_codes from public, anon, authenticated;
grant select, insert, update, delete on public.qr_codes to authenticated;
grant all on public.qr_codes to service_role;
drop policy if exists qr_codes_own_all on public.qr_codes;
create policy qr_codes_own_all on public.qr_codes for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke all on public.qr_scans from public, anon, authenticated;
grant select on public.qr_scans to authenticated;
grant all on public.qr_scans to service_role;
drop policy if exists qr_scans_owner_select on public.qr_scans;
create policy qr_scans_owner_select on public.qr_scans for select to authenticated
  using (exists (select 1 from public.qr_codes c where c.id = qr_scans.code_id and c.user_id = auth.uid()));

revoke all on public.visits from public, anon, authenticated;
grant all on public.visits to service_role;

revoke all on public.upgrade_requests from public, anon, authenticated;
grant all on public.upgrade_requests to service_role;
drop policy if exists upgrade_requests_own_all on public.upgrade_requests;

revoke all on public.admins from public, anon, authenticated;
grant all on public.admins to service_role;

insert into public.admins (email) values ('kiransavireddy@gmail.com')
  on conflict (email) do nothing;
