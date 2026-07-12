import { HTTP_STATUS } from '@/constants/http-status';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { signInRequestSchema } from '@/lib/zod/schemas/form-schema';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: VALIDATION.INVALID_REQUEST }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const parsed = signInRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? VALIDATION.INVALID_REQUEST },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const { email, password, portal } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? HTTP_STATUS.BAD_REQUEST });
  }

  const { data } = await supabase.auth.getClaims();
  const role = data?.claims?.user_role;

  if (!role) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: VALIDATION.SIGN_IN_FAILED }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  // Wrong portal, respond exactly like a bad password so accounts can't be probed.
  if (role !== portal) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: VALIDATION.INVALID_CREDENTIALS }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  return NextResponse.json({ role }, { status: HTTP_STATUS.OK });
}
