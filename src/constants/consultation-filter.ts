import { CONSULTATION_STATUS } from '@/constants/consultation-status';

export const CONSULTATION_FILTER = {
  UPCOMING: 'upcoming',
  PAST: 'past',
} as const;

export const PAST_STATUSES = [
  CONSULTATION_STATUS.PAST,
  CONSULTATION_STATUS.COMPLETE,
  CONSULTATION_STATUS.INCOMPLETE,
  CONSULTATION_STATUS.CANCELLED,
] as const;
