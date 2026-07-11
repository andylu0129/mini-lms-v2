import { HTTP_STATUS } from '@/constants/http-status';
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? HTTP_STATUS.BAD_REQUEST });
  }

  return NextResponse.json({ user: data.user }, { status: HTTP_STATUS.CREATED });
}
