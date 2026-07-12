import { CONSULTATION_STATUS, CONSULTATION_STATUS_LABELS } from '@/constants/consultation-status';
import { Badge } from '@/lib/shadcn/components/ui/badge';
import type { ConsultationStatus } from '@/types/global';
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, ClockIcon, HistoryIcon } from 'lucide-react';

const CONFIG: Record<ConsultationStatus, { variant: 'default' | 'secondary' | 'outline'; icon: typeof ClockIcon }> = {
  [CONSULTATION_STATUS.UPCOMING]: { variant: 'default', icon: ClockIcon },
  [CONSULTATION_STATUS.PAST]: { variant: 'outline', icon: HistoryIcon },
  [CONSULTATION_STATUS.COMPLETE]: { variant: 'secondary', icon: CircleCheckIcon },
  [CONSULTATION_STATUS.INCOMPLETE]: { variant: 'outline', icon: CircleAlertIcon },
  [CONSULTATION_STATUS.CANCELLED]: { variant: 'outline', icon: CircleXIcon },
};

export function StatusBadge({ status }: { status: ConsultationStatus }) {
  const { variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant} className={status === CONSULTATION_STATUS.CANCELLED ? 'text-muted-foreground' : undefined}>
      <Icon data-icon="inline-start" />
      {CONSULTATION_STATUS_LABELS[status]}
    </Badge>
  );
}
