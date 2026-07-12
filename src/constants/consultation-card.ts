export const CONSULTATION_CARD = {
  MARK_COMPLETE: 'Mark complete',
  MARK_INCOMPLETE: 'Mark incomplete',
  LOCKED_PREFIX: 'Changes close ',
  LOCKED_SUFFIX: ' minutes before the start time.',
} as const;

// How close to the start time reschedule/cancel stay available.
export const LEAD_TIME_MINUTES = 60;
