import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { ERRORS } from '@/constants/errors';
import { HTTP_STATUS } from '@/constants/http-status';
import { TABLES } from '@/constants/tables';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { consultationUpdateSchema } from '@/lib/zod/schemas/form-schema';
import { canMark, canModify, toConsultation } from '@/utils/consultations';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: VALIDATION.INVALID_REQUEST }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: VALIDATION.INVALID_REQUEST }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const parsed = consultationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? VALIDATION.INVALID_REQUEST },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: VALIDATION.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const { datetime, status } = parsed.data;

  const { data: existing, error: fetchError } = await supabase
    .from(TABLES.CONSULTATIONS)
    .select()
    .eq('id', id)
    .single();

  if (fetchError) {
    if (fetchError.code === ERRORS.POSTGREST_NO_ROWS) {
      return NextResponse.json({ error: VALIDATION.CONSULTATION_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
    }

    console.error('Failed to load consultation:', fetchError);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  // Enforce status lifecycle rules with the server time due to the reason that
  // the client-side only checks decide which buttons render and the client's local time can be changed.
  const current = toConsultation(existing);
  const wantsRescheduleOrCancel = datetime !== undefined || status === CONSULTATION_STATUS.CANCELLED;
  const wantsMark = status === CONSULTATION_STATUS.COMPLETE || status === CONSULTATION_STATUS.INCOMPLETE;
  if ((wantsRescheduleOrCancel && !canModify(current)) || (wantsMark && !canMark(current))) {
    return NextResponse.json({ error: VALIDATION.CONSULTATION_LOCKED }, { status: HTTP_STATUS.CONFLICT });
  }

  const { data, error } = await supabase
    .from(TABLES.CONSULTATIONS)
    .update({
      ...(datetime !== undefined && { datetime }),
      ...(status !== undefined && { status }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === ERRORS.POSTGREST_NO_ROWS) {
      return NextResponse.json({ error: VALIDATION.CONSULTATION_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
    }

    console.error('Failed to update consultation:', error);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  return NextResponse.json({ consultation: toConsultation(data) }, { status: HTTP_STATUS.OK });
}
