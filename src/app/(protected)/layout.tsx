import { AppHeader } from '@/components/app-header';
import { AuthProvider } from '@/lib/supabase/auth-provider';
import { getUserDataFromToken } from '@/lib/supabase/server';

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authUser = await getUserDataFromToken();

  return (
    <AuthProvider user={authUser}>
      <div className="bg-background min-h-screen">
        <AppHeader />
        {children}
      </div>
    </AuthProvider>
  );
}
