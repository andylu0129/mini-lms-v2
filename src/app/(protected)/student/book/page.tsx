import { BookingForm } from '@/components/student/booking-form';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/lib/shadcn/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={ROUTES.STUDENT_DASHBOARD}>
            <ArrowLeftIcon data-icon="inline-start" />
            Back to dashboard
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-balance">Book a consultation</h1>
          <p className="text-muted-foreground text-sm text-pretty">Schedule a new session.</p>
        </div>
      </div>
      <BookingForm />
    </div>
  );
}
