'use client';

import { CANCEL_DIALOG } from '@/constants/cancel-dialog';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { API_ROUTES } from '@/constants/routes';
import { VALIDATION } from '@/constants/validation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/lib/shadcn/components/ui/alert-dialog';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Spinner } from '@/lib/shadcn/components/ui/spinner';
import { CircleXIcon } from 'lucide-react';
import { useState } from 'react';

export function CancelDialog({ consultation, onChanged }: { consultation: Consultation; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel(event: React.MouseEvent) {
    // AlertDialogAction closes on click by default; stay open until the
    // request settles.
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ROUTES.CONSULTATIONS}/${consultation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: CONSULTATION_STATUS.CANCELLED }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error ?? VALIDATION.SERVER_ERROR);
        return;
      }
      setOpen(false);
      onChanged();
    } catch {
      setError(VALIDATION.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !loading && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <CircleXIcon data-icon="inline-start" />
          {CANCEL_DIALOG.TRIGGER}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <CircleXIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>{CANCEL_DIALOG.TITLE}</AlertDialogTitle>
          <AlertDialogDescription>{CANCEL_DIALOG.DESCRIPTION}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{CANCEL_DIALOG.KEEP}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? CANCEL_DIALOG.CANCELLING : CANCEL_DIALOG.CONFIRM}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
