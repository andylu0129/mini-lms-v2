import { ROUTES } from '@/constants/routes';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have proxy refreshing
          // user sessions.
        }
      },
    },
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name);
    }
  });
}

export async function getVerifiedUserData() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user?.id || error) {
    redirect(`${ROUTES.AUTH}${ROUTES.SIGN_IN}`);
  }

  return { firstName: user.user_metadata?.first_name, lastName: user.user_metadata?.last_name };
}

export async function getUserDataFromToken() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.email || !data?.claims?.user_role) {
    redirect(`${ROUTES.AUTH}${ROUTES.SIGN_IN}`);
  }

  return {
    firstName: data.claims?.user_metadata?.first_name,
    lastName: data.claims?.user_metadata?.last_name,
    email: data.claims?.email,
    role: data.claims?.user_role,
  };
}
