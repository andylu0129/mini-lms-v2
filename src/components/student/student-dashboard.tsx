'use client';

import { ConsultationCard } from '@/components/consultation-card';
import { CONSULTATION_FILTER, PAST_STATUSES } from '@/constants/consultation-filter';
import { CONSULTATION_STATUS } from '@/constants/consultation-status';
import { API_ROUTES, ROUTES } from '@/constants/routes';
import { STUDENT_DASHBOARD } from '@/constants/student-dashboard';
import { useInfiniteConsultations } from '@/hooks/use-infinite-consultations';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/shadcn/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/lib/shadcn/components/ui/empty';
import { Skeleton } from '@/lib/shadcn/components/ui/skeleton';
import { Spinner } from '@/lib/shadcn/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/shadcn/components/ui/tabs';
import { useUserDetails } from '@/lib/supabase/auth-provider';
import {
  CalendarPlusIcon,
  CircleCheckIcon,
  ClockIcon,
  InboxIcon,
  RotateCwIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

function StatCard({ label, value, icon: Icon }: { label: string; value: number | null; icon: typeof ClockIcon }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-lg">
          <Icon className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          {value === null ? (
            <Skeleton className="h-6 w-8" />
          ) : (
            <span className="font-heading text-2xl leading-none font-semibold">{value}</span>
          )}
          <span className="text-muted-foreground text-sm">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function StudentDashboard() {
  const user = useUserDetails();
  const [filter, setFilter] = useState<ConsultationFilter>(CONSULTATION_FILTER.UPCOMING);
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const { consultations, isLoading, hasMore, error, sentinelRef, retry, reload } = useInfiniteConsultations(filter);

  const loadStats = useCallback(() => {
    fetch(API_ROUTES.CONSULTATION_STATS)
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body?.stats) {
          setStats(body.stats);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // A reschedule, cancel or mark moves rows between filters, so refresh both
  // the list and the stats.
  const handleChanged = () => {
    reload();
    loadStats();
  };

  const pastCount = stats ? PAST_STATUSES.reduce((sum, status) => sum + stats[status], 0) : null;
  const totalCount = stats ? Object.values(stats).reduce((sum, count) => sum + count, 0) : null;

  const isUpcoming = filter === CONSULTATION_FILTER.UPCOMING;
  const list =
    error && consultations.length === 0 ? (
      <Empty className="border-destructive/30 border">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>{STUDENT_DASHBOARD.ERROR_TITLE}</EmptyTitle>
          <EmptyDescription>{STUDENT_DASHBOARD.ERROR_DESCRIPTION}</EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" onClick={retry}>
          <RotateCwIcon data-icon="inline-start" />
          {STUDENT_DASHBOARD.RETRY}
        </Button>
      </Empty>
    ) : isLoading && consultations.length === 0 ? (
      <ListSkeleton />
    ) : consultations.length === 0 ? (
      <EmptyState
        title={isUpcoming ? STUDENT_DASHBOARD.EMPTY_UPCOMING_TITLE : STUDENT_DASHBOARD.EMPTY_PAST_TITLE}
        description={
          isUpcoming ? STUDENT_DASHBOARD.EMPTY_UPCOMING_DESCRIPTION : STUDENT_DASHBOARD.EMPTY_PAST_DESCRIPTION
        }
      />
    ) : (
      <div className="flex flex-col gap-4">
        {consultations.map((consultation) => (
          <ConsultationCard key={consultation.id} consultation={consultation} onChanged={handleChanged} />
        ))}
        {isLoading && (
          <div className="flex justify-center py-2">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center gap-3 py-2">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={retry}>
              <RotateCwIcon data-icon="inline-start" />
              {STUDENT_DASHBOARD.RETRY}
            </Button>
          </div>
        )}
        {hasMore && !isLoading && !error && <div ref={sentinelRef} aria-hidden className="h-px" />}
      </div>
    );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-balance">
            {STUDENT_DASHBOARD.WELCOME}, {user.firstName}
          </h1>
          <p className="text-muted-foreground text-sm">{STUDENT_DASHBOARD.DESCRIPTION}</p>
        </div>
        <Button asChild size="lg">
          <Link href={ROUTES.STUDENT_BOOK}>
            <CalendarPlusIcon data-icon="inline-start" />
            {STUDENT_DASHBOARD.BOOK}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={STUDENT_DASHBOARD.STAT_UPCOMING}
          value={stats && stats[CONSULTATION_STATUS.UPCOMING]}
          icon={ClockIcon}
        />
        <StatCard
          label={STUDENT_DASHBOARD.STAT_COMPLETED}
          value={stats && stats[CONSULTATION_STATUS.COMPLETE]}
          icon={CircleCheckIcon}
        />
        <StatCard label={STUDENT_DASHBOARD.STAT_TOTAL} value={totalCount} icon={CalendarPlusIcon} />
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as ConsultationFilter)}>
        <TabsList>
          <TabsTrigger value={CONSULTATION_FILTER.UPCOMING}>
            {STUDENT_DASHBOARD.TAB_UPCOMING}
            {stats !== null && ` (${stats[CONSULTATION_STATUS.UPCOMING]})`}
          </TabsTrigger>
          <TabsTrigger value={CONSULTATION_FILTER.PAST}>
            {STUDENT_DASHBOARD.TAB_PAST}
            {pastCount !== null && ` (${pastCount})`}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={CONSULTATION_FILTER.UPCOMING} className="mt-4">
          {isUpcoming && list}
        </TabsContent>
        <TabsContent value={CONSULTATION_FILTER.PAST} className="mt-4">
          {!isUpcoming && list}
        </TabsContent>
      </Tabs>
    </div>
  );
}
