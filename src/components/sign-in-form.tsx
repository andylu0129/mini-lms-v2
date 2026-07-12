'use client';

import { AuthShell } from '@/components/auth-shell';
import { FIELDS } from '@/constants/fields';
import { ROLES } from '@/constants/roles';
import { API_ROUTES, ROUTES } from '@/constants/routes';
import { SIGN_IN_FORM } from '@/constants/sign-in-form';
import { Alert, AlertDescription, AlertTitle } from '@/lib/shadcn/components/ui/alert';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent } from '@/lib/shadcn/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/lib/shadcn/components/ui/field';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Spinner } from '@/lib/shadcn/components/ui/spinner';
import { SignInFormValues, signInFormSchema } from '@/lib/zod/schemas/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCapIcon, ShieldCheckIcon, TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function SignInForm() {
  const [isAdmin, setIsAdmin] = useState(false);
  const text = isAdmin ? SIGN_IN_FORM.ADMIN : SIGN_IN_FORM.STUDENT;
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const response = await fetch(API_ROUTES.SIGN_IN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, portal: isAdmin ? ROLES.ADMIN : ROLES.STUDENT }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError('root', { message: body?.error ?? SIGN_IN_FORM.GENERIC_ERROR });
        return;
      }
      router.push(body?.role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD);
      router.refresh();
    } catch {
      setError('root', { message: SIGN_IN_FORM.GENERIC_ERROR });
    }
  };

  return (
    <AuthShell
      icon={isAdmin ? <ShieldCheckIcon className="size-6" /> : <GraduationCapIcon className="size-6" />}
      title={text.TITLE}
      subtitle={text.SUBTITLE}
      footer={
        isAdmin ? undefined : (
          <>
            {SIGN_IN_FORM.STUDENT.FOOTER_PROMPT}{' '}
            <Link
              href={`${ROUTES.AUTH}${ROUTES.SIGN_UP}`}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {SIGN_IN_FORM.STUDENT.FOOTER_LINK}
            </Link>
          </>
        )
      }
    >
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {errors.root && (
                <Alert variant="destructive">
                  <TriangleAlertIcon />
                  <AlertTitle>{text.ERROR_TITLE}</AlertTitle>
                  <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
              )}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">{text.EMAIL_LABEL}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={SIGN_IN_FORM.EMAIL_PLACEHOLDER}
                  aria-invalid={!!errors.email}
                  disabled={isSubmitting}
                  {...register(FIELDS.EMAIL)}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">{SIGN_IN_FORM.PASSWORD_LABEL}</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  disabled={isSubmitting}
                  {...register(FIELDS.PASSWORD)}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {isSubmitting ? text.SUBMITTING : text.SUBMIT}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs">
        {text.SWITCH_PROMPT}{' '}
        <button
          type="button"
          onClick={() => {
            clearErrors('root');
            setIsAdmin((current) => !current);
          }}
          className="cursor-pointer font-medium underline-offset-4 hover:underline"
        >
          {text.SWITCH_LINK}
        </button>
      </div>
    </AuthShell>
  );
}
