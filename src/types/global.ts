import type { Database, Enums, Tables } from '@/types/database';

// The stored enum plus 'past', which is derived (an 'upcoming' row whose time
// has passed) and never stored.
export type ConsultationStatus = Enums<'consultation_status'> | 'past';

export type ConsultationFilter = 'upcoming' | 'past';

export type ConsultationStats = Record<ConsultationStatus, number>;

// One row of the admin_consultation_stats() function, as generated.
export type AdminStats = Database['public']['Functions']['admin_consultation_stats']['Returns'][number];

export type AdminStatusFilter = 'all' | ConsultationStatus;

export type Consultation = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  firstName: string;
  lastName: string;
  reason: string;
  datetime: string;
  status: ConsultationStatus;
  createdAt: string;
};

// Row shape of public.consultations, derived from the generated schema types
// so it cannot drift from the database. Note its status is the stored 4-value
// enum: 'past' only exists after toConsultation() derives it.
export type ConsultationRow = Tables<'consultations'>;
