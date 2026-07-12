// Mirrors the public.consultation_status enum in the database, plus PAST,
// which is derived (an 'upcoming' row whose time has passed) and never stored.
export const CONSULTATION_STATUS = {
  UPCOMING: 'upcoming',
  PAST: 'past',
  COMPLETE: 'complete',
  INCOMPLETE: 'incomplete',
  CANCELLED: 'cancelled',
} as const;

export const CONSULTATION_STATUS_LABELS: Record<ConsultationStatus, string> = {
  [CONSULTATION_STATUS.UPCOMING]: 'Upcoming',
  [CONSULTATION_STATUS.PAST]: 'Past',
  [CONSULTATION_STATUS.COMPLETE]: 'Complete',
  [CONSULTATION_STATUS.INCOMPLETE]: 'Incomplete',
  [CONSULTATION_STATUS.CANCELLED]: 'Cancelled',
} as const;
