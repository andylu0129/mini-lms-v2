-- Overview stats for the admin portal, computed with a single aggregate pass.
-- Security invoker (the default), so RLS still applies: admins aggregate every
-- row via their 'consultations.read' permission, while any other caller only
-- aggregates rows RLS lets them see (their own).

create function public.admin_consultation_stats()
returns table (total bigint, upcoming bigint, students bigint)
language sql
stable
set search_path = ''
as $$
  select
    count(*) as total,
    count(*) filter (
      where consultation.status = 'upcoming' and consultation.datetime > now()
    ) as upcoming,
    count(distinct consultation.user_id) as students
  from public.consultations consultation;
$$;
