-- Lifecycle rules enforced at the data layer with the database clock, so they
-- hold even for direct PostgREST calls that bypass the app's API. The API
-- performs the same checks first to return friendly errors,
-- this trigger is the authoritative backstop.

create or replace function public.enforce_consultation_lifecycle()
returns trigger
set search_path = ''
as $$
declare
  -- Keep in sync with LEAD_TIME_MINUTES in src/constants/consultation-card.ts.
  lead_time constant interval := interval '60 minutes';
begin
  -- New bookings and datetime changes must be at least the lead time ahead,
  -- matching the reschedule/cancel window.
  if (tg_op = 'INSERT' or new.datetime is distinct from old.datetime)
     and new.datetime <= now() + lead_time then
    raise exception 'consultation time must be at least % ahead', lead_time;
  end if;

  if tg_op = 'INSERT' then
    return new;
  end if;

  -- Complete, incomplete and cancelled are the final states, no further changes.
  if old.status <> 'upcoming' then
    raise exception 'consultation is % and can no longer be changed', old.status;
  end if;

  -- Reschedule/cancel are only allowed until the lead-time window before the start closes.
  if (new.datetime is distinct from old.datetime or new.status = 'cancelled')
     and old.datetime <= now() + lead_time then
    raise exception 'consultation is locked for changes';
  end if;

  -- Mark as complete/incomplete are allowed once the consultation's time has passed.
  if new.status in ('complete', 'incomplete') and old.datetime > now() then
    raise exception 'consultation cannot be marked before it takes place';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger enforce_consultation_lifecycle
  before insert or update on public.consultations
  for each row execute function public.enforce_consultation_lifecycle();

