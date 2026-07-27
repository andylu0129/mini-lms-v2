'use client';

import { BOOKING_FORM } from '@/constants/booking-form';
import { FIELDS } from '@/constants/fields';
import { API_ROUTES, ROUTES } from '@/constants/routes';
import { TIME } from '@/constants/time';
import { Alert, AlertDescription, AlertTitle } from '@/lib/shadcn/components/ui/alert';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Calendar } from '@/lib/shadcn/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/lib/shadcn/components/ui/field';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/shadcn/components/ui/popover';
import { Spinner } from '@/lib/shadcn/components/ui/spinner';
import { Textarea } from '@/lib/shadcn/components/ui/textarea';
import { useUserDetails } from '@/lib/supabase/auth-provider';
import { BookingFormValues, bookingFormSchema } from '@/lib/zod/schemas/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { CalendarIcon, CalendarPlusIcon, CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function BookingForm() {
  const router = useRouter();
  const user = useUserDetails();
  const [success, setSuccess] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    },
  });

  const disabled = isSubmitting || success;

  const onSubmit = async (values: BookingFormValues) => {
    const datetime = parse(values.time, TIME.TIME_INPUT_FORMAT, values.date).toISOString();

    try {
      const response = await fetch(API_ROUTES.CONSULTATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          reason: values.reason,
          datetime,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError('root', { message: body?.error ?? BOOKING_FORM.GENERIC_ERROR });
        return;
      }
      setSuccess(true);
      router.push(ROUTES.STUDENT_DASHBOARD);
    } catch {
      setError('root', { message: BOOKING_FORM.GENERIC_ERROR });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{BOOKING_FORM.TITLE}</CardTitle>
        <CardDescription>{BOOKING_FORM.DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {success && (
              <Alert>
                <CircleCheckIcon className="text-primary" />
                <AlertTitle>{BOOKING_FORM.SUCCESS_TITLE}</AlertTitle>
                <AlertDescription>{BOOKING_FORM.SUCCESS_DESCRIPTION}</AlertDescription>
              </Alert>
            )}
            {errors.root && (
              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>{BOOKING_FORM.ERROR_TITLE}</AlertTitle>
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-5 sm:flex-row">
              <Field data-invalid={!!errors.firstName}>
                <FieldLabel htmlFor="first-name">{BOOKING_FORM.FIRST_NAME_LABEL}</FieldLabel>
                <Input
                  id="first-name"
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  disabled={true}
                  {...register(FIELDS.FIRST_NAME)}
                />
                <FieldError errors={[errors.firstName]} />
              </Field>
              <Field data-invalid={!!errors.lastName}>
                <FieldLabel htmlFor="last-name">{BOOKING_FORM.LAST_NAME_LABEL}</FieldLabel>
                <Input
                  id="last-name"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  disabled={true}
                  {...register(FIELDS.LAST_NAME)}
                />
                <FieldError errors={[errors.lastName]} />
              </Field>
            </div>
            <Field data-invalid={!!errors.reason}>
              <FieldLabel htmlFor="reason">{BOOKING_FORM.REASON_LABEL}</FieldLabel>
              <Textarea
                id="reason"
                rows={4}
                placeholder={BOOKING_FORM.REASON_PLACEHOLDER}
                aria-invalid={!!errors.reason}
                disabled={disabled}
                {...register(FIELDS.REASON)}
              />
              <FieldError errors={[errors.reason]} />
            </Field>
            <div className="flex flex-col gap-5 sm:flex-row">
              <Field data-invalid={!!errors.date}>
                <FieldLabel htmlFor="date">{BOOKING_FORM.DATE_LABEL}</FieldLabel>
                <Controller
                  control={control}
                  name={FIELDS.DATE}
                  render={({ field }) => (
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          id="date"
                          variant="outline"
                          className="justify-start font-normal"
                          aria-invalid={!!errors.date}
                          disabled={disabled}
                        >
                          <CalendarIcon data-icon="inline-start" />
                          {field.value ? format(field.value, TIME.DATE_DISPLAY_FORMAT) : BOOKING_FORM.DATE_PLACEHOLDER}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setDateOpen(false);
                          }}
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FieldError errors={[errors.date]} />
              </Field>
              <Field data-invalid={!!errors.time}>
                <FieldLabel htmlFor="time">{BOOKING_FORM.TIME_LABEL}</FieldLabel>
                <Input
                  id="time"
                  type="time"
                  aria-invalid={!!errors.time}
                  disabled={disabled}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  {...register(FIELDS.TIME)}
                />
                <FieldError errors={[errors.time]} />
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="lg" disabled={disabled}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {!isSubmitting && !success && <CalendarPlusIcon data-icon="inline-start" />}
                {isSubmitting ? BOOKING_FORM.SUBMITTING : success ? BOOKING_FORM.SUBMITTED : BOOKING_FORM.SUBMIT}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(ROUTES.STUDENT_DASHBOARD)}
                disabled={disabled}
              >
                {BOOKING_FORM.CANCEL}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
