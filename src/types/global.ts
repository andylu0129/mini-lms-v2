type ConsultationStatus = 'upcoming' | 'complete' | 'incomplete' | 'cancelled';

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
