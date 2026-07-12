import { LEAD_TIME_MINUTES } from '@/constants/consultation-card';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { TIME } from '@/constants/time';
import type { Consultation, ConsultationRow } from '@/types/global';
import { format, formatDistanceToNow } from 'date-fns';

export function toConsultation(row: ConsultationRow): Consultation {
  // 'past' status is derived based on an 'upcoming' consultation whose time has passed.
  const isPastDue = row.status === CONSULTATION_STATUS.UPCOMING && new Date(row.datetime).getTime() <= Date.now();

  return {
    id: row.id,
    studentId: row.user_id,
    studentName: `${row.first_name} ${row.last_name}`,
    studentEmail: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    reason: row.reason,
    datetime: row.datetime,
    status: isPastDue ? CONSULTATION_STATUS.PAST : row.status,
    createdAt: row.created_at,
  };
}

export function formatDate(datetime: string) {
  return format(new Date(datetime), 'PPP');
}

export function formatTime(datetime: string) {
  return format(new Date(datetime), 'p');
}

// e.g. "in 3 days", "2 hours ago".
export function relativeLabel(datetime: string) {
  return formatDistanceToNow(new Date(datetime), { addSuffix: true });
}

export function canModify(consultation: Consultation) {
  return (
    consultation.status === CONSULTATION_STATUS.UPCOMING &&
    new Date(consultation.datetime).getTime() - Date.now() > LEAD_TIME_MINUTES * TIME.MS_PER_MINUTE
  );
}

export function canMark(consultation: Consultation) {
  return consultation.status === CONSULTATION_STATUS.PAST;
}
