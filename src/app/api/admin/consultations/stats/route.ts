import { HTTP_STATUS } from '@/constants/http-status';
import { ROLES } from '@/constants/roles';
import { RPCS } from '@/constants/rpcs';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import type { AdminStats } from '@/types/global';
import { NextResponse } from 'next/server';


export async function GET() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: VALIDATION.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  if (claimsData.claims.user_role !== ROLES.ADMIN) {
    return NextResponse.json({ error: VALIDATION.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
  }

  const { data, error } = await supabase.rpc(RPCS.ADMIN_CONSULTATION_STATS);
  if (error) {
    console.error('Failed to load admin consultation stats:', error);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  const row = ((data ?? []) as AdminStats[])[0];
  const stats: AdminStats = {
    total: Number(row?.total ?? 0),
    upcoming: Number(row?.upcoming ?? 0),
    students: Number(row?.students ?? 0),
  };

  return NextResponse.json({ stats }, { status: HTTP_STATUS.OK });
}
