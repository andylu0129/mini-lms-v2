import { BookingForm } from '@/components/student/booking-form';
import { BOOK_PAGE } from '@/constants/book-page';
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
            {BOOK_PAGE.BACK_TO_DASHBOARD}
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-balance">{BOOK_PAGE.TITLE}</h1>
          <p className="text-muted-foreground text-sm text-pretty">{BOOK_PAGE.DESCRIPTION}</p>
        </div>
      </div>
      <BookingForm />
    </div>
  );
}
