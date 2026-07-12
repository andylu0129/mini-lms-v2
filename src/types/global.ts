// 'past' is derived, never stored: an 'upcoming' row whose time has passed.
type ConsultationStatus = 'upcoming' | 'past' | 'complete' | 'incomplete' | 'cancelled';

type ConsultationFilter = 'upcoming' | 'past';

type ConsultationStats = Record<ConsultationStatus, number>;

type AdminStats = {
  total: number;
  upcoming: number;
  students: number;
};

type AdminStatusFilter = 'all' | ConsultationStatus;

type Consultation = {
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

// Row shape of public.consultations as returned by PostgREST.
type ConsultationRow = {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  reason: string;
  datetime: string;
  status: ConsultationStatus;
  created_at: string;
};
