import { STATUS_FILTER_ALL } from '@/constants/consultation-filter';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { HTTP_STATUS } from '@/constants/http-status';
import { PAGINATION } from '@/constants/pagination';
import { QUERY_PARAMS } from '@/constants/query-params';
import { ROLES } from '@/constants/roles';
import { TABLES } from '@/constants/tables';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { toConsultation } from '@/utils/consultations';
import { NextResponse } from 'next/server';

const STATUS_FILTERS: string[] = [STATUS_FILTER_ALL, ...Object.values(CONSULTATION_STATUS)];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get(QUERY_PARAMS.PAGE) ?? 1);
  const status = searchParams.get(QUERY_PARAMS.STATUS) ?? STATUS_FILTER_ALL;
  const search = (searchParams.get(QUERY_PARAMS.SEARCH) ?? '').trim();

  if (!Number.isInteger(page) || page < 1 || !STATUS_FILTERS.includes(status)) {
    return NextResponse.json({ error: VALIDATION.INVALID_REQUEST }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: VALIDATION.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }
  // RLS is the authoritative gate (a non-admin would only see their own rows);
  // this check exists to return an explicit error instead of partial data.
  if (claimsData.claims.user_role !== ROLES.ADMIN) {
    return NextResponse.json({ error: VALIDATION.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
  }

  let query = supabase.from(TABLES.CONSULTATIONS).select('*', { count: 'exact' });

  // 'upcoming' and 'past' are time-dependent: both are stored as 'upcoming'
  // and split by whether the consultation time has passed.
  const now = new Date().toISOString();
  if (status === CONSULTATION_STATUS.UPCOMING) {
    query = query.eq('status', CONSULTATION_STATUS.UPCOMING).gt('datetime', now);
  } else if (status === CONSULTATION_STATUS.PAST) {
    query = query.eq('status', CONSULTATION_STATUS.UPCOMING).lte('datetime', now);
  } else if (status !== STATUS_FILTER_ALL) {
    query = query.eq('status', status);
  }

  if (search) {
    // Commas and parentheses delimit PostgREST or() conditions; drop them
    // from user input rather than trying to escape them.
    const term = search.replace(/[,()]/g, ' ').trim();
    if (term) {
      const pattern = `*${term}*`;
      query = query.or(
        `first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},reason.ilike.${pattern}`,
      );
    }
  }

  const pageSize = PAGINATION.ADMIN_TABLE_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order('datetime', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    // Never forward database errors to the client - they leak schema details.
    console.error('Failed to list consultations for admin:', error);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  const rows = (data ?? []) as ConsultationRow[];
  return NextResponse.json(
    { consultations: rows.map(toConsultation), total: count ?? 0 },
    { status: HTTP_STATUS.OK },
  );
}
