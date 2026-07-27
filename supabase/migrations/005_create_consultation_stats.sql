-- Per-student consultation stats, computed with a single grouped aggregate in
-- the database instead of fetching every row to count client-side. Split by
-- time as well as status, so tab counts can match the lists: a consultation
-- whose status is still 'upcoming' but whose datetime has passed belongs to
-- the past tab, not the upcoming one. Uses the database clock so the split
-- can't be skewed by a client clock.

-- Serves both the stats aggregate below (leftmost prefix user_id, status) and
-- the dashboard's status-filtered, datetime-ordered list queries.
create index idx_consultations_user_status_datetime
  on public.consultations (user_id, status, datetime);

-- Security invoker (the default), so RLS on public.consultations still applies.
create function public.consultation_stats()
returns table (status public.consultation_status, past boolean, count bigint)
language sql
stable
set search_path = ''
as $$
  select consultation.status, consultation.datetime <= now() as past, count(*)
  from public.consultations consultation
  where consultation.user_id = (select auth.uid())
  group by consultation.status, past;
$$;
