-- Consultations: bookings made by students, readable in full by admins.

create type public.consultation_status as enum ('upcoming', 'complete', 'incomplete', 'cancelled');

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null,
  last_name  text not null,
  reason text not null,
  datetime timestamptz not null,
  status public.consultation_status not null default 'upcoming',
  created_at timestamptz not null default now()
);

create index idx_consultations_datetime on public.consultations (user_id, datetime);

alter table public.consultations enable row level security;

-- Students manage their own consultations (update covers reschedule, cancel,
-- and marking complete/incomplete). No delete policy: cancelling is a status change.
create policy "Students can read their own consultations" on public.consultations
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students can create their own consultations" on public.consultations
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Students can update their own consultations" on public.consultations
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Admins are read-only, their permission grants select on everything, nothing else.
create policy "Allow authorised read access" on public.consultations
  for select to authenticated
  using ((select public.authorize('consultations.read')));

-- Prevent created_at from being modified on update.
create or replace function public.preserve_created_at()
returns trigger as $$
begin
  new.created_at := old.created_at;
  return new;
end;
$$ language plpgsql;