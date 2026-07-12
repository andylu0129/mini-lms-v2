import { CONSULTATION_FILTER } from '@/constants/consultation-filter';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { HTTP_STATUS } from '@/constants/http-status';
import { PAGINATION } from '@/constants/pagination';
import { QUERY_PARAMS } from '@/constants/query-params';
import { TABLES } from '@/constants/tables';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { consultationRequestSchema } from '@/lib/zod/schemas/form-schema';
import { toConsultation } from '@/utils/consultations';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get(QUERY_PARAMS.FILTER) ?? CONSULTATION_FILTER.UPCOMING;
  const offset = Number(searchParams.get(QUERY_PARAMS.OFFSET) ?? 0);
  if (
    (filter !== CONSULTATION_FILTER.UPCOMING && filter !== CONSULTATION_FILTER.PAST) ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    return NextResponse.json({ error: VALIDATION.INVALID_REQUEST }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: VALIDATION.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  // Upcoming: still-upcoming rows whose time hasn't passed yet, soonest first.
  // Past: everything else - complete/incomplete/cancelled, plus still-upcoming
  // rows already past their time (shown there so they can be marked) - most
  // recent first. RLS scopes rows to the signed-in student.
  const now = new Date().toISOString();
  const base = supabase.from(TABLES.CONSULTATIONS).select();
  const query =
    filter === CONSULTATION_FILTER.UPCOMING
      ? base.eq('status', CONSULTATION_STATUS.UPCOMING).gt('datetime', now).order('datetime', { ascending: true })
      : base
          .or(`status.neq.${CONSULTATION_STATUS.UPCOMING},datetime.lte.${now}`)
          .order('datetime', { ascending: false });

  const pageSize = PAGINATION.CONSULTATIONS_PAGE_SIZE;
  const { data, error } = await query.range(offset, offset + pageSize - 1);

  if (error) {
    // Never forward database errors to the client - they leak schema details.
    console.error('Failed to list consultations:', error);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  const rows = (data ?? []) as ConsultationRow[];
  return NextResponse.json(
    { consultations: rows.map(toConsultation), hasMore: rows.length === pageSize },
    { status: HTTP_STATUS.OK },
  );
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
