import { LEAD_TIME_MINUTES } from '@/constants/consultation-card';
import { TIME } from '@/constants/time';
import type { Consultation, ConsultationRow } from '@/types/global';
import { canMark, canModify, formatDate, formatTime, relativeLabel, toConsultation } from '@/utils/consultations';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const NOW = new Date('2026-07-12T12:00:00.000Z');

function minutesFromNow(minutes: number): string {
  return new Date(NOW.getTime() + minutes * TIME.MS_PER_MINUTE).toISOString();
}

function makeRow(overrides: Partial<ConsultationRow> = {}): ConsultationRow {
  return {
    id: 'c0a80121-0000-4000-8000-000000000001',
    user_id: 'c0a80121-0000-4000-8000-000000000002',
    email: 'ada@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    reason: 'Course planning',
    datetime: minutesFromNow(120),
    status: 'upcoming',
    created_at: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeConsultation(overrides: Partial<Consultation> = {}): Consultation {
  return {
    id: 'c0a80121-0000-4000-8000-000000000001',
    studentId: 'c0a80121-0000-4000-8000-000000000002',
    studentName: 'Ada Lovelace',
    studentEmail: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    reason: 'Course planning',
    datetime: minutesFromNow(120),
    status: 'upcoming',
    createdAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('toConsultation', () => {
  it('maps a snake_case row to a camelCase consultation', () => {
    expect(toConsultation(makeRow())).toEqual(makeConsultation());
  });

  it("derives 'past' for an upcoming row whose time has passed", () => {
    const consultation = toConsultation(makeRow({ datetime: minutesFromNow(-5) }));
    expect(consultation.status).toBe('past');
  });

  it("derives 'past' when the time is exactly now", () => {
    const consultation = toConsultation(makeRow({ datetime: minutesFromNow(0) }));
    expect(consultation.status).toBe('past');
  });

  it('leaves stored terminal statuses untouched even when the time has passed', () => {
    expect(toConsultation(makeRow({ status: 'complete', datetime: minutesFromNow(-60) })).status).toBe('complete');
    expect(toConsultation(makeRow({ status: 'incomplete', datetime: minutesFromNow(-60) })).status).toBe('incomplete');
    expect(toConsultation(makeRow({ status: 'cancelled', datetime: minutesFromNow(60) })).status).toBe('cancelled');
  });
});

describe('canModify', () => {
  it('allows an upcoming consultation more than the lead time ahead', () => {
    expect(canModify(makeConsultation({ datetime: minutesFromNow(LEAD_TIME_MINUTES + 1) }))).toBe(true);
  });

  it('locks at exactly the lead-time boundary', () => {
    expect(canModify(makeConsultation({ datetime: minutesFromNow(LEAD_TIME_MINUTES) }))).toBe(false);
  });

  it('locks inside the lead-time window', () => {
    expect(canModify(makeConsultation({ datetime: minutesFromNow(LEAD_TIME_MINUTES - 1) }))).toBe(false);
  });

  it('rejects non-upcoming statuses regardless of time', () => {
    expect(canModify(makeConsultation({ status: 'past', datetime: minutesFromNow(-5) }))).toBe(false);
    expect(canModify(makeConsultation({ status: 'complete' }))).toBe(false);
    expect(canModify(makeConsultation({ status: 'cancelled' }))).toBe(false);
  });
});

describe('canMark', () => {
  it("allows only the derived 'past' status", () => {
    expect(canMark(makeConsultation({ status: 'past', datetime: minutesFromNow(-5) }))).toBe(true);
  });

  it('rejects every other status', () => {
    expect(canMark(makeConsultation({ status: 'upcoming' }))).toBe(false);
    expect(canMark(makeConsultation({ status: 'complete' }))).toBe(false);
    expect(canMark(makeConsultation({ status: 'incomplete' }))).toBe(false);
    expect(canMark(makeConsultation({ status: 'cancelled' }))).toBe(false);
  });
});

describe('relativeLabel', () => {
  it('describes future times with an "in ..." suffix', () => {
    expect(relativeLabel(minutesFromNow(24 * 60))).toBe('in 1 day');
  });

  it('describes elapsed times with an "... ago" suffix', () => {
    expect(relativeLabel(minutesFromNow(-120))).toBe('about 2 hours ago');
  });
});

describe('formatDate / formatTime', () => {
  // Exact output depends on the runner's timezone, so only smoke-test shape.
  it('formats a readable date containing the year', () => {
    expect(formatDate(minutesFromNow(0))).toContain('2026');
  });

  it('formats a clock time', () => {
    expect(formatTime(minutesFromNow(0))).toMatch(/\d{1,2}:\d{2}/);
  });
});
