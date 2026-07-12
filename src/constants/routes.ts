export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  ADMIN_SIGNIN: '/admin/sign-in',
  ADMIN_DASHBOARD: '/admin/dashboard',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_BOOK: '/student/book',
} as const;

export const API_ROUTES = {
  ROOT: '/api',
  SIGN_IN: '/api/auth/sign-in',
  SIGN_UP: '/api/auth/sign-up',
  SIGN_OUT: '/api/auth/sign-out',
  CONSULTATIONS: '/api/consultations',
  CONSULTATION_STATS: '/api/consultations/stats',
  ADMIN_CONSULTATIONS: '/api/admin/consultations',
  ADMIN_CONSULTATION_STATS: '/api/admin/consultations/stats',
} as const;
