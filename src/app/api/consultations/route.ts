import { HTTP_STATUS } from '@/constants/http-status';
import { TABLES } from '@/constants/tables';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { consultationRequestSchema } from '@/lib/zod/schemas/form-schema';
import { NextResponse } from 'next/server';

type ConsultationRow = {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  reason: string;
  datetime: string;
  status: ConsultationStatus;
  created_at: string;
};

function toConsultation(row: ConsultationRow): Consultation {
  return {
    id: row.id,
    studentId: row.user_id,
    studentName: `${row.first_name} ${row.last_name}`,
    studentEmail: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    reason: row.reason,
    datetime: row.datetime,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: VALIDATION.INVALID_REQUEST }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const parsed = consultationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? VALIDATION.INVALID_REQUEST },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) {
    return NextResponse.json({ error: VALIDATION.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const { firstName, lastName, reason, datetime } = parsed.data;
  const { data, error } = await supabase
    .from(TABLES.CONSULTATIONS)
    .insert({
      user_id: claims.sub,
      email: claims.email,
      first_name: firstName,
      last_name: lastName,
      reason,
      datetime,
    })
    .select()
    .single();

  if (error) {
    // Never forward database errors to the client - they leak schema details.
    console.error('Failed to create consultation:', error);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  return NextResponse.json({ consultation: toConsultation(data) }, { status: HTTP_STATUS.CREATED });
}
