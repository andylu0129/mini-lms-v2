import { HTTP_STATUS } from '@/constants/http-status';
import { ROLES } from '@/constants/roles';
import { RPCS } from '@/constants/rpcs';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type AdminStatsRow = { total: number; upcoming: number; students: number };

export async function GET() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: VALIDATION.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }
  // RLS is the authoritative gate (a non-admin would only aggregate their own
  // rows); this check exists to return an explicit error instead.
  if (claimsData.claims.user_role !== ROLES.ADMIN) {
    return NextResponse.json({ error: VALIDATION.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
  }

  const { data, error } = await supabase.rpc(RPCS.ADMIN_CONSULTATION_STATS);
  if (error) {
    // Never forward database errors to the client - they leak schema details.
    console.error('Failed to load admin consultation stats:', error);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  const row = ((data ?? []) as AdminStatsRow[])[0];
  const stats: AdminStats = {
    total: Number(row?.total ?? 0),
    upcoming: Number(row?.upcoming ?? 0),
    students: Number(row?.students ?? 0),
  };

  return NextResponse.json({ stats }, { status: HTTP_STATUS.OK });
}
