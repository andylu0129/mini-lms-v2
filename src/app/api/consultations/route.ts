import { CONSULTATION_FILTER } from '@/constants/consultation-filter';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { HTTP_STATUS } from '@/constants/http-status';
import { PAGINATION } from '@/constants/pagination';
import { QUERY_PARAMS } from '@/constants/query-params';
import { TABLES } from '@/constants/tables';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { consultationRequestSchema } from '@/lib/zod/schemas/form-schema';
import type { ConsultationRow } from '@/types/global';
import { toConsultation } from '@/utils/consultations';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get(QUERY_PARAMS.FILTER) ?? CONSULTATION_FILTER.UPCOMING;
  const offset = Number(searchParams.get(QUERY_PARAMS.OFFSET) ?? 0);
  const asOfParam = searchParams.get(QUERY_PARAMS.AS_OF);
  const asOfTime = asOfParam === null ? null : new Date(asOfParam).getTime();
  if (
    (filter !== CONSULTATION_FILTER.UPCOMING && filter !== CONSULTATION_FILTER.PAST) ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    (asOfTime !== null && Number.isNaN(asOfTime))
  ) {
    return NextResponse.json({ error: VALIDATION.INVALID_REQUEST }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: VALIDATION.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  // The time boundary is pinned to the client's asOf for a whole scroll session.
  // Re-evaluating now() per page lets rows cross the boundary between
  // pages, shifting the offsets so a row gets skipped or duplicated.
  const asOf = new Date(asOfTime === null ? Date.now() : Math.min(asOfTime, Date.now())).toISOString();
  const base = supabase.from(TABLES.CONSULTATIONS).select();
  const query =
    filter === CONSULTATION_FILTER.UPCOMING
      ? base.eq('status', CONSULTATION_STATUS.UPCOMING).gt('datetime', asOf).order('datetime', { ascending: true })
      : base
          .or(`status.neq.${CONSULTATION_STATUS.UPCOMING},datetime.lte.${asOf}`)
          .order('datetime', { ascending: false });

  const pageSize = PAGINATION.CONSULTATIONS_PAGE_SIZE;
  const { data, error } = await query.range(offset, offset + pageSize - 1);

  if (error) {
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
    console.error('Failed to create consultation:', error);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  return NextResponse.json({ consultation: toConsultation(data) }, { status: HTTP_STATUS.CREATED });
}
