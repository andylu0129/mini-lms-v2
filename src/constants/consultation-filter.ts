import { CONSULTATION_STATUS } from '@/constants/consultation-status';

export const CONSULTATION_FILTER = {
  UPCOMING: 'upcoming',
  PAST: 'past',
} as const;

// Admin table status filter value meaning "no status filter".
export const STATUS_FILTER_ALL = 'all';

export const PAST_STATUSES = [
  CONSULTATION_STATUS.PAST,
  CONSULTATION_STATUS.COMPLETE,
  CONSULTATION_STATUS.INCOMPLETE,
  CONSULTATION_STATUS.CANCELLED,
] as const;
