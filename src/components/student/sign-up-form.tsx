'use client';

import { FIELDS } from '@/constants/fields';
import { API_ROUTES, ROUTES } from '@/constants/routes';
import { SIGN_UP_FORM } from '@/constants/sign-up-form';
import { Alert, AlertDescription, AlertTitle } from '@/lib/shadcn/components/ui/alert';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent } from '@/lib/shadcn/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/lib/shadcn/components/ui/field';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Spinner } from '@/lib/shadcn/components/ui/spinner';
import { SignUpFormValues, signUpFormSchema } from '@/lib/zod/schemas/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCapIcon, MailCheckIcon, TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthShell } from '../auth-shell';

export default function SignUpForm() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      const response = await fetch(API_ROUTES.SIGN_UP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError('root', { message: body?.error ?? SIGN_UP_FORM.GENERIC_ERROR });
        return;
      }
      setSuccess(true);
    } catch {
      setError('root', { message: SIGN_UP_FORM.GENERIC_ERROR });
    }
  };

  return (
    <AuthShell
      icon={<GraduationCapIcon className="size-6" />}
      title={SIGN_UP_FORM.TITLE}
      subtitle={SIGN_UP_FORM.SUBTITLE}
      footer={
        <>
          {SIGN_UP_FORM.FOOTER_PROMPT}{' '}
          <Link
            href={`${ROUTES.AUTH}${ROUTES.SIGN_IN}`}
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            {SIGN_UP_FORM.FOOTER_LINK}
          </Link>
        </>
      }
    >
      <Card>
        <CardContent>
          {success ? (
            <Alert>
              <MailCheckIcon />
              <AlertTitle>{SIGN_UP_FORM.SUCCESS_TITLE}</AlertTitle>
              <AlertDescription>{SIGN_UP_FORM.SUCCESS_DESCRIPTION}</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                {errors.root && (
                  <Alert variant="destructive">
                    <TriangleAlertIcon />
                    <AlertTitle>{SIGN_UP_FORM.ERROR_TITLE}</AlertTitle>
                    <AlertDescription>{errors.root.message}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!errors.firstName}>
                    <FieldLabel htmlFor="first-name">{SIGN_UP_FORM.FIRST_NAME_LABEL}</FieldLabel>
                    <Input
                      id="first-name"
                      autoComplete="given-name"
                      aria-invalid={!!errors.firstName}
                      disabled={isSubmitting}
                      {...register(FIELDS.FIRST_NAME)}
                    />
                    <FieldError errors={[errors.firstName]} />
                  </Field>
                  <Field data-invalid={!!errors.lastName}>
                    <FieldLabel htmlFor="last-name">{SIGN_UP_FORM.LAST_NAME_LABEL}</FieldLabel>
                    <Input
                      id="last-name"
                      autoComplete="family-name"
                      aria-invalid={!!errors.lastName}
                      disabled={isSubmitting}
                      {...register(FIELDS.LAST_NAME)}
                    />
                    <FieldError errors={[errors.lastName]} />
                  </Field>
                </div>
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">{SIGN_UP_FORM.EMAIL_LABEL}</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={SIGN_UP_FORM.EMAIL_PLACEHOLDER}
                    aria-invalid={!!errors.email}
                    disabled={isSubmitting}
                    {...register(FIELDS.EMAIL)}
                  />
                  <FieldError errors={[errors.email]} />
                </Field>
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">{SIGN_UP_FORM.PASSWORD_LABEL}</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    disabled={isSubmitting}
                    {...register(FIELDS.PASSWORD)}
                  />
                  <FieldError errors={[errors.password]} />
                </Field>
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirm-password">{SIGN_UP_FORM.CONFIRM_PASSWORD_LABEL}</FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    disabled={isSubmitting}
                    {...register(FIELDS.CONFIRM_PASSWORD)}
                  />
                  <FieldError errors={[errors.confirmPassword]} />
                </Field>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting && <Spinner data-icon="inline-start" />}
                  {isSubmitting ? SIGN_UP_FORM.SUBMITTING : SIGN_UP_FORM.SUBMIT}
                </Button>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
