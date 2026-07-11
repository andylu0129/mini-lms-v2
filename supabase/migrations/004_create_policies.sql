-- Map permissions to roles. Granting a new role a capability (or adding a new
-- permission) is an insert here - no policy rewrites needed.
insert into public.role_permissions (role, permission)
values
  ('admin', 'consultations.read');

-- Policies on domain tables check permissions via authorize(), e.g. once
-- public.consultations exists:
--
-- create policy "Allow authorised read access" on public.consultations
--   for select to authenticated using ( (select authorize('consultations.read')) );

