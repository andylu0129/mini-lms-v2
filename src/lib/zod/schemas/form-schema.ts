import { ROLES } from '@/constants/roles';
import { VALIDATION } from '@/constants/validation';
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
