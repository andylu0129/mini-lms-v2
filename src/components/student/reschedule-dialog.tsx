'use client';

import { FIELDS } from '@/constants/fields';
import { RESCHEDULE_DIALOG } from '@/constants/reschedule-dialog';
import { API_ROUTES } from '@/constants/routes';
import { VALIDATION } from '@/constants/validation';
import { Alert, AlertTitle } from '@/lib/shadcn/components/ui/alert';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Calendar } from '@/lib/shadcn/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/lib/shadcn/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/lib/shadcn/components/ui/field';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/shadcn/components/ui/popover';
import { Spinner } from '@/lib/shadcn/components/ui/spinner';
import { RescheduleFormValues, rescheduleFormSchema } from '@/lib/zod/schemas/form-schema';
import type { Consultation } from '@/types/global';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { CalendarIcon, TriangleAlertIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function RescheduleDialog({ consultation, onChanged }: { consultation: Consultation; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const when = new Date(consultation.datetime);
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleFormSchema),
    defaultValues: { date: when, time: format(when, 'HH:mm') },
  });

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) {
      return;
    }
    setOpen(next);
    if (next) {
      reset({ date: when, time: format(when, 'HH:mm') });
    }
  };

  const onSubmit = async (values: RescheduleFormValues) => {
    const datetime = parse(values.time, 'HH:mm', values.date).toISOString();
    try {
      const response = await fetch(`${API_ROUTES.CONSULTATIONS}/${consultation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datetime }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError('root', { message: body?.error ?? VALIDATION.SERVER_ERROR });
        return;
      }
      setOpen(false);
      onChanged();
    } catch {
      setError('root', { message: VALIDATION.SERVER_ERROR });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon data-icon="inline-start" />
          {RESCHEDULE_DIALOG.TRIGGER}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{RESCHEDULE_DIALOG.TITLE}</DialogTitle>
          <DialogDescription>{RESCHEDULE_DIALOG.DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {errors.root && (
              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>{errors.root.message}</AlertTitle>
              </Alert>
            )}
            <Field data-invalid={!!errors.date}>
              <FieldLabel htmlFor="reschedule-date">{RESCHEDULE_DIALOG.DATE_LABEL}</FieldLabel>
              <Controller
                control={control}
                name={FIELDS.DATE}
                render={({ field }) => (
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        id="reschedule-date"
                        variant="outline"
                        className="justify-start font-normal"
                        aria-invalid={!!errors.date}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon data-icon="inline-start" />
                        {field.value ? format(field.value, 'PPP') : RESCHEDULE_DIALOG.DATE_PLACEHOLDER}
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
              <FieldLabel htmlFor="reschedule-time">{RESCHEDULE_DIALOG.TIME_LABEL}</FieldLabel>
              <Input
                id="reschedule-time"
                type="time"
                aria-invalid={!!errors.time}
                disabled={isSubmitting}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                {...register(FIELDS.TIME)}
              />
              <FieldError errors={[errors.time]} />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                {RESCHEDULE_DIALOG.CANCEL}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {isSubmitting ? RESCHEDULE_DIALOG.SUBMITTING : RESCHEDULE_DIALOG.SUBMIT}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
