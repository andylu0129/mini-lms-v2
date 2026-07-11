// Mirrors the public.consultation_status enum in the database.
export const CONSULTATION_STATUS = {
  UPCOMING: 'upcoming',
  COMPLETE: 'complete',
  INCOMPLETE: 'incomplete',
  CANCELLED: 'cancelled',
} as const;
