import { LEAD_TIME_MINUTES } from '@/constants/consultation-card';

export const VALIDATION = {
  FIRST_NAME_REQUIRED: 'First name is required.',
  LAST_NAME_REQUIRED: 'Last name is required.',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
  PASSWORD_MIN: 'Password must be at least 8 characters.',
  PASSWORD_MAX: 'Password must be at most 64 characters.',
  PASSWORD_COMPLEXITY:
    'Password must include an uppercase letter, a lowercase letter, a number, and a special character.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
  PASSWORD_REQUIRED: 'Password is required.',
  INVALID_REQUEST: 'Invalid request.',
  REASON_REQUIRED: 'Reason for consultation is required.',
  DATETIME_INVALID: 'Enter a valid date and time.',
  DATETIME_TOO_SOON: `Consultation time must be at least ${LEAD_TIME_MINUTES} minutes from now.`,
  DATE_REQUIRED: 'Pick a date.',
  TIME_REQUIRED: 'Pick a time.',
  NOTHING_TO_UPDATE: 'Nothing to update.',
  UNAUTHORIZED: 'You must be signed in.',
  FORBIDDEN: 'You do not have access to this resource.',
  CONSULTATION_NOT_FOUND: 'Consultation not found.',
  CONSULTATION_LOCKED: 'Changes are closed for this consultation.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  INVALID_CREDENTIALS: 'Invalid login credentials',
  SIGN_IN_FAILED: 'Unable to sign in. Please try again later.',
} as const;
