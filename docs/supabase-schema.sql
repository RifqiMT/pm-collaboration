-- TeamCompass room document store for Vercel + Supabase.
-- Run once in Supabase → SQL Editor → New query → Run.

create table if not exists public.cadence_store (
  id text primary key,
  data jsonb not null default '{"rooms":{}}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.cadence_store (id, data)
values ('rooms', '{"rooms":{}}'::jsonb)
on conflict (id) do nothing;

alter table public.cadence_store enable row level security;

-- Allows the anon key to read/write the document store.
-- Anyone who has the anon key can mutate rooms (same trust model as open CORS).
-- Prefer SUPABASE_SERVICE_ROLE_KEY on Vercel and then drop this policy.
drop policy if exists "cadence_store_anon_all" on public.cadence_store;
create policy "cadence_store_anon_all"
  on public.cadence_store
  for all
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update on public.cadence_store to anon, authenticated, service_role;
