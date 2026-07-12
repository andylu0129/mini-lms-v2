// Supabase auth error codes (https://supabase.com/docs/guides/auth/debugging/error-codes)
export const ERRORS = {
  USER_ALREADY_EXISTS: 'user_already_exists',
  EMAIL_EXISTS: 'email_exists',
  // PostgREST: .single() matched no rows (nonexistent id or blocked by RLS).
  POSTGREST_NO_ROWS: 'PGRST116',
} as const;
