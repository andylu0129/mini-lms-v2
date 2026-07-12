-- Split the stats by time as well as status, so tab counts can match the
-- lists: a consultation whose status is still 'upcoming' but whose datetime
-- has passed belongs to the past tab, not the upcoming one. Uses the database
-- clock so the split can't be skewed by a client clock.

-- The return signature changes, so the old function must be dropped first.
drop function if exists public.consultation_stats();

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
