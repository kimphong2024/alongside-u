-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  caregiver_name text,
  lovee_name text,
  relationship text,
  illness_type text,
  illness_stage text,
  prognosis text,
  diagnosed_date text,
  situation jsonb default '[]'::jsonb,
  mobility text,
  communication text,
  language text,
  patient_knows text,
  emotional text,
  is_primary text,
  family_helps text,
  priorities jsonb default '[]'::jsonb,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: select own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Profiles: insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Profiles: update own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Profiles: delete own" on public.profiles for delete to authenticated using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Family members table
create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text,
  email text,
  created_at timestamptz default now()
);

alter table public.family_members enable row level security;

create index family_members_owner_idx on public.family_members(owner_id);

create policy "Family: select own" on public.family_members for select to authenticated using (auth.uid() = owner_id);
create policy "Family: insert own" on public.family_members for insert to authenticated with check (auth.uid() = owner_id);
create policy "Family: update own" on public.family_members for update to authenticated using (auth.uid() = owner_id);
create policy "Family: delete own" on public.family_members for delete to authenticated using (auth.uid() = owner_id);
