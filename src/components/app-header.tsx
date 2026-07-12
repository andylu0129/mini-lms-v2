'use client';

import { BROADCAST } from '@/constants/common';
import { API_ROUTES, ROUTES } from '@/constants/routes';
import { Avatar, AvatarFallback } from '@/lib/shadcn/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/lib/shadcn/components/ui/dropdown-menu';
import { Spinner } from '@/lib/shadcn/components/ui/spinner';
import { useUserDetails } from '@/lib/supabase/auth-provider';
import { GraduationCapIcon, LogOutIcon, ShieldCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AppHeader() {
  const router = useRouter();
  const user = useUserDetails();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch(API_ROUTES.SIGN_OUT, { method: 'POST' });
    } catch {}

    // The route handler clears cookies even when sign-out fails; if the
    // request itself failed, still redirect since the user wants to leave.
    new BroadcastChannel(BROADCAST.CHANNEL_AUTH).postMessage(BROADCAST.MESSAGE_SIGN_OUT);
    router.push(`${ROUTES.AUTH}${ROUTES.SIGN_IN}`);
  };

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href={'/'} className="font-heading flex items-center gap-2 text-base font-semibold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            {isAdmin ? <ShieldCheckIcon className="size-4" /> : <GraduationCapIcon className="size-4" />}
          </span>
          Mini-LMS
        </Link>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="bg-accent text-accent-foreground hidden rounded-full px-3 py-1 text-xs font-medium sm:inline">
              Admin portal
            </span>
          )}
          <DropdownMenu open={menuOpen || isSigningOut} onOpenChange={(next) => !isSigningOut && setMenuOpen(next)}>
            <DropdownMenuTrigger asChild>
              <button className="focus-visible:ring-ring flex cursor-pointer items-center gap-2 rounded-full outline-none focus-visible:ring-2">
                <Avatar className="size-9">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="truncate font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-muted-foreground truncate text-xs font-normal">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isSigningOut}
                  className="cursor-pointer"
                  onSelect={(event) => {
                    // Keep the menu open so the pending state stays visible.
                    event.preventDefault();
                    handleSignOut();
                  }}
                >
                  {isSigningOut ? <Spinner data-icon="inline-start" /> : <LogOutIcon data-icon="inline-start" />}
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
