'use client';

import { StatusBadge } from '@/components/status-badge';
import { CancelDialog } from '@/components/student/cancel-dialog';
import { MarkDialog } from '@/components/student/mark-dialog';
import { RescheduleDialog } from '@/components/student/reschedule-dialog';
import { CONSULTATION_CARD, LEAD_TIME_MINUTES } from '@/constants/consultation-card';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { Separator } from '@/lib/shadcn/components/ui/separator';
import type { Consultation } from '@/types/global';
import { canMark, canModify, formatDate, formatTime, relativeLabel } from '@/utils/consultations';
import { CalendarIcon, ClockIcon, LockIcon } from 'lucide-react';

export function ConsultationCard({ consultation, onChanged }: { consultation: Consultation; onChanged: () => void }) {
  const modifiable = canModify(consultation);
  const markable = canMark(consultation);
  const isUpcoming = consultation.status === CONSULTATION_STATUS.UPCOMING;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-pretty">{consultation.reason}</CardTitle>
          <StatusBadge status={consultation.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="text-muted-foreground flex items-center gap-2">
          <CalendarIcon className="size-4" />
          <span className="text-foreground">{formatDate(consultation.datetime)}</span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <ClockIcon className="size-4" />
          <span className="text-foreground">{formatTime(consultation.datetime)}</span>
          {isUpcoming && <span className="text-muted-foreground">· {relativeLabel(consultation.datetime)}</span>}
        </div>
      </CardContent>
      {(isUpcoming || markable) && (
        <CardFooter className="flex-col items-stretch gap-3">
          <Separator />
          {modifiable ? (
            <div className="flex items-center gap-2">
              <RescheduleDialog consultation={consultation} onChanged={onChanged} />
              <CancelDialog consultation={consultation} onChanged={onChanged} />
            </div>
          ) : markable ? (
            <div className="flex items-center gap-2">
              <MarkDialog consultation={consultation} status={CONSULTATION_STATUS.COMPLETE} onChanged={onChanged} />
              <MarkDialog consultation={consultation} status={CONSULTATION_STATUS.INCOMPLETE} onChanged={onChanged} />
            </div>
          ) : (
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <LockIcon className="size-3.5" />
              {CONSULTATION_CARD.LOCKED_PREFIX}
              {LEAD_TIME_MINUTES}
              {CONSULTATION_CARD.LOCKED_SUFFIX}
            </p>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
