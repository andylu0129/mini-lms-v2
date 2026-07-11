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
  INVALID_CREDENTIALS: 'Invalid login credentials',
  SIGN_IN_FAILED: 'Unable to sign in. Please try again later.',
} as const;
