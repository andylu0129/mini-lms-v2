import { ERRORS } from '@/constants/errors';
import { HTTP_STATUS } from '@/constants/http-status';
import { ROUTES } from '@/constants/routes';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { signUpFormSchema } from '@/lib/zod/schemas/form-schema';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: VALIDATION.INVALID_REQUEST }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const parsed = signUpFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? VALIDATION.INVALID_REQUEST },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const { email, password, firstName, lastName } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${new URL(request.url).origin}${ROUTES.AUTH}${ROUTES.SIGN_IN}`,
    },
  });

  // Prevent account enumeration: an already-registered email must be
  // indistinguishable from a successful sign-up, and the user object is never returned.
  if (error && error.code !== ERRORS.USER_ALREADY_EXISTS && error.code !== ERRORS.EMAIL_EXISTS) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? HTTP_STATUS.BAD_REQUEST });
  }

  return NextResponse.json({ success: true }, { status: HTTP_STATUS.CREATED });
}
