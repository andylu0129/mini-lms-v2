import { HTTP_STATUS } from '@/constants/http-status';
import { clearAuthCookies, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  // Revoke only this session; global scope would sign the user out of every device.
  // signOut() also removes the session cookies through the SSR cookie adapter.
  const { error } = await supabase.auth.signOut();

  if (error) {
    // Revocation failed (or there was no valid session) - still remove the
    // cookies so the browser cannot keep auto-authenticating with them.
    await clearAuthCookies();
  }

  // Always report success: from the client's perspective the user is signed out.
  return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
}
