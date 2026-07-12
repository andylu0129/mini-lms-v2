import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { HTTP_STATUS } from '@/constants/http-status';
import { RPCS } from '@/constants/rpcs';
import { VALIDATION } from '@/constants/validation';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type StatsRow = { status: ConsultationStatus; past: boolean; count: number };

export async function GET() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: VALIDATION.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const { data, error } = await supabase.rpc(RPCS.CONSULTATION_STATS);
  if (error) {
    // Never forward database errors to the client - they leak schema details.
    console.error('Failed to load consultation stats:', error);
    return NextResponse.json({ error: VALIDATION.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  // The function only returns rows for buckets that exist; fill the rest with 0.
  // A still-'upcoming' row whose time has passed counts as PAST, the derived
  // status, so it never inflates the upcoming count.
  const stats: ConsultationStats = {
    [CONSULTATION_STATUS.UPCOMING]: 0,
    [CONSULTATION_STATUS.PAST]: 0,
    [CONSULTATION_STATUS.COMPLETE]: 0,
    [CONSULTATION_STATUS.INCOMPLETE]: 0,
    [CONSULTATION_STATUS.CANCELLED]: 0,
  };
  for (const row of ((data ?? []) as StatsRow[])) {
    if (row.status === CONSULTATION_STATUS.UPCOMING && row.past) {
      stats[CONSULTATION_STATUS.PAST] += Number(row.count);
    } else {
      stats[row.status] += Number(row.count);
    }
  }

  return NextResponse.json({ stats }, { status: HTTP_STATUS.OK });
}
