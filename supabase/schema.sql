-- Dream Dare Do Network registration system
-- Run this file once in Supabase SQL Editor.

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  institution text not null,
  whatsapp text not null,
  email text not null,
  reason text not null,
  niche text not null,
  receipt_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

-- Public visitors may submit registrations, but cannot read the member list.
drop policy if exists "public can submit registrations" on public.members;
create policy "public can submit registrations"
on public.members for insert
to anon, authenticated
with check (true);

-- Private receipt storage.
insert into storage.buckets (id, name, public)
values ('registration-receipts', 'registration-receipts', false)
on conflict (id) do nothing;

-- Visitors may upload receipts into the private bucket.
drop policy if exists "public can upload registration receipts" on storage.objects;
create policy "public can upload registration receipts"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'registration-receipts');

-- Authenticated admins can later read receipts after we add the admin role system.
drop policy if exists "authenticated can read registration receipts" on storage.objects;
create policy "authenticated can read registration receipts"
on storage.objects for select
to authenticated
using (bucket_id = 'registration-receipts');
