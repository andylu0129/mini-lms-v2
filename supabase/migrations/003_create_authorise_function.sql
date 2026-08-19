create or replace function public.authorize(
  requested_permission app_permission
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
  declare
    bind_permissions int;
    user_role public.app_role;
  begin
    -- Fetch user role once and store it to reduce number of calls
    select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

    -- Hybrid check: the student claim is trusted as-is (students hold no
    -- permissions, so a stale claim cannot over-grant), but an admin claim is
    -- re-verified against user_roles so revoking an admin takes effect on the
    -- next query instead of at token expiry. Identity still comes from the
    -- verified JWT via auth.uid(); security definer lets the lookup bypass
    -- the revoked access on user_roles.
    if user_role = 'admin' then
      select role into user_role
      from public.user_roles
      where user_id = (select auth.uid());
    end if;

    select count(*)
    into bind_permissions
    from public.role_permissions
    where role_permissions.permission = requested_permission
      and role_permissions.role = user_role;

    return bind_permissions > 0;
  end;
$$;
