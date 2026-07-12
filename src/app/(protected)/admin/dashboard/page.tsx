import { AdminView } from '@/components/admin/admin-view';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { getUserDataFromToken } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await getUserDataFromToken();
  if (user.role !== ROLES.ADMIN) {
    redirect(ROUTES.SIGN_IN);
  }

  return <AdminView />;
}
