'use client';

import { CONSULTATION_CARD } from '@/constants/consultation-card';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { MARK_DIALOG } from '@/constants/mark-dialog';
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
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import { useState } from 'react';

export function MarkDialog({
  consultation,
  status,
  onChanged,
}: {
  consultation: Consultation;
  status: ConsultationStatus;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete = status === CONSULTATION_STATUS.COMPLETE;
  const Icon = isComplete ? CircleCheckIcon : CircleAlertIcon;
  const label = isComplete ? CONSULTATION_CARD.MARK_COMPLETE : CONSULTATION_CARD.MARK_INCOMPLETE;

  async function handleConfirm(event: React.MouseEvent) {
    // AlertDialogAction closes on click by default; stay open until the
    // request settles.
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ROUTES.CONSULTATIONS}/${consultation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
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
        <Button variant="outline" size="sm">
          <Icon data-icon="inline-start" />
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{isComplete ? MARK_DIALOG.COMPLETE_TITLE : MARK_DIALOG.INCOMPLETE_TITLE}</AlertDialogTitle>
          <AlertDialogDescription>{MARK_DIALOG.DESCRIPTION}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{MARK_DIALOG.BACK}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? MARK_DIALOG.CONFIRMING : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
