import { LEAD_TIME_MINUTES } from '@/constants/consultation-card';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { FIELDS } from '@/constants/fields';
import { ROLES } from '@/constants/roles';
import { TIME } from '@/constants/time';
import { VALIDATION } from '@/constants/validation';
import { parse } from 'date-fns';
import { z } from 'zod';

export const signUpFormSchema = z
  .object({
    firstName: z.string().min(1, VALIDATION.FIRST_NAME_REQUIRED),
    lastName: z.string().min(1, VALIDATION.LAST_NAME_REQUIRED),
    email: z.email(),
    password: z
      .string()
      .min(VALIDATION.PASSWORD_MIN_LENGTH, VALIDATION.PASSWORD_MIN)
      .max(VALIDATION.PASSWORD_MAX_LENGTH, VALIDATION.PASSWORD_MAX)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/, VALIDATION.PASSWORD_COMPLEXITY),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: VALIDATION.PASSWORDS_DO_NOT_MATCH,
      path: ['confirmPassword'],
    },
  );

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export const signInFormSchema = z.object({
  email: z.email(),
  password: z.string().min(1, VALIDATION.PASSWORD_REQUIRED),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;

export const signInRequestSchema = signInFormSchema.extend({
  portal: z.enum([ROLES.STUDENT, ROLES.ADMIN]),
});

export type SignInRequestValues = z.infer<typeof signInRequestSchema>;

const scheduleFields = {
  date: z.date({ error: VALIDATION.DATE_REQUIRED }),
  time: z.string().min(1, VALIDATION.TIME_REQUIRED),
};

export const bookingFormSchema = z
  .object({
    firstName: z.string().min(1, VALIDATION.FIRST_NAME_REQUIRED),
    lastName: z.string().min(1, VALIDATION.LAST_NAME_REQUIRED),
    reason: z.string().min(1, VALIDATION.REASON_REQUIRED),
    ...scheduleFields,
  })
  .superRefine((data, ctx) => {
    if (parse(data.time, 'HH:mm', data.date).getTime() <= Date.now() + LEAD_TIME_MINUTES * TIME.MS_PER_MINUTE) {
      ctx.addIssue({ code: 'custom', message: VALIDATION.DATETIME_TOO_SOON, path: [FIELDS.TIME] });
    }
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const rescheduleFormSchema = z.object(scheduleFields).superRefine((data, ctx) => {
  if (parse(data.time, 'HH:mm', data.date).getTime() <= Date.now() + LEAD_TIME_MINUTES * TIME.MS_PER_MINUTE) {
    ctx.addIssue({ code: 'custom', message: VALIDATION.DATETIME_TOO_SOON, path: [FIELDS.TIME] });
  }
});

export type RescheduleFormValues = z.infer<typeof rescheduleFormSchema>;

// What the consultations API receives. The datetime check runs on the server
// clock, so a client with an adjusted clock can't book into the past.
export const consultationRequestSchema = z.object({
  firstName: z.string().min(1, VALIDATION.FIRST_NAME_REQUIRED),
  lastName: z.string().min(1, VALIDATION.LAST_NAME_REQUIRED),
  reason: z.string().min(1, VALIDATION.REASON_REQUIRED),
  datetime: z.iso
    .datetime({ offset: true, error: VALIDATION.DATETIME_INVALID })
    .refine(
      (value) => new Date(value).getTime() > Date.now() + LEAD_TIME_MINUTES * TIME.MS_PER_MINUTE,
      VALIDATION.DATETIME_TOO_SOON,
    ),
});

export type ConsultationRequestValues = z.infer<typeof consultationRequestSchema>;

// Partial update: reschedule (datetime), cancel, or mark complete/incomplete (status).
export const consultationUpdateSchema = z
  .object({
    datetime: z.iso
      .datetime({ offset: true, error: VALIDATION.DATETIME_INVALID })
      .refine(
        (value) => new Date(value).getTime() > Date.now() + LEAD_TIME_MINUTES * TIME.MS_PER_MINUTE,
        VALIDATION.DATETIME_TOO_SOON,
      ),
    status: z.enum([
      // CONSULTATION_STATUS.UPCOMING, // Not needed since it's the default state, irreversible once changed to other states.
      CONSULTATION_STATUS.COMPLETE,
      CONSULTATION_STATUS.INCOMPLETE,
      CONSULTATION_STATUS.CANCELLED,
    ]),
  })
  .partial()
  .refine((data) => data.datetime !== undefined || data.status !== undefined, {
    message: VALIDATION.NOTHING_TO_UPDATE,
  });

export type ConsultationUpdateValues = z.infer<typeof consultationUpdateSchema>;
