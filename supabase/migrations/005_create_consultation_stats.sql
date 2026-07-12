-- Per-student consultation stats, computed with a single grouped aggregate in
-- the database instead of fetching every row to count client-side.

-- Serves both the stats aggregate below (leftmost prefix user_id, status) and
-- the dashboard's status-filtered, datetime-ordered list queries.
create index idx_consultations_user_status_datetime
  on public.consultations (user_id, status, datetime);

-- Security invoker (the default), so RLS on public.consultations still applies.
create or replace function public.consultation_stats()
returns table (status public.consultation_status, count bigint)
language sql
stable
set search_path = ''
as $$
  select consultation.status, count(*)
  from public.consultations consultation
  where consultation.user_id = (select auth.uid())
  group by consultation.status;
$$;
