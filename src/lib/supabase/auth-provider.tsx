'use client';

import { BROADCAST } from '@/constants/common';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'student';
};

const UserDetailsContext = createContext<UserDetails | null>(null);

export function useUserDetails() {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error('useUserDetails must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ user, children }: { user: UserDetails; children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    // Listens for future auth changes and redirect if session expires mid-browsing.
    // Does not sign out other tabs and browsers.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        router.push(ROUTES.SIGN_IN);
      }
    });

    // Listens for sign-out broadcasts from other tabs.
    const channel = new BroadcastChannel(BROADCAST.CHANNEL_AUTH);
    channel.onmessage = (event) => {
      if (event.data === BROADCAST.MESSAGE_SIGN_OUT) {
        setIsAuthenticated(false);
        router.push(ROUTES.SIGN_IN);
      }
    };

    return () => {
      subscription.unsubscribe();
      channel.close();
    };
  }, [supabase, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <UserDetailsContext.Provider value={user}>{children}</UserDetailsContext.Provider>;
}
