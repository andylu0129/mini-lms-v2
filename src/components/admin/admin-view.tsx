'use client';

import { StatusBadge } from '@/components/status-badge';
import { ADMIN_VIEW } from '@/constants/admin-view';
import { STATUS_FILTER_ALL } from '@/constants/consultation-filter';
import { CONSULTATION_STATUS, CONSULTATION_STATUS_LABELS } from '@/constants/consultation-status';
import { PAGINATION } from '@/constants/pagination';
import { API_ROUTES } from '@/constants/routes';
import { TIME } from '@/constants/time';
import { useAdminConsultations } from '@/hooks/use-admin-consultations';
import { useDebounce } from '@/hooks/use-debounce';
import { Avatar, AvatarFallback } from '@/lib/shadcn/components/ui/avatar';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/lib/shadcn/components/ui/empty';
import { Input } from '@/lib/shadcn/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/shadcn/components/ui/select';
import { Skeleton } from '@/lib/shadcn/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/shadcn/components/ui/table';
import type { AdminStats, AdminStatusFilter } from '@/types/global';
import { formatDate, formatTime } from '@/utils/consultations';
import {
  CalendarCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  RotateCwIcon,
  SearchIcon,
  TriangleAlertIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

export function AdminView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>(STATUS_FILTER_ALL);
  const [page, setPage] = useState(1);

  const search = useDebounce(query.trim(), TIME.SEARCH_DEBOUNCE_MS);
  const { consultations, total, isLoading, error, reload } = useAdminConsultations({
    page,
    status: statusFilter,
    search,
  });

  useEffect(() => {
    fetch(API_ROUTES.ADMIN_CONSULTATION_STATS)
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body?.stats) {
          setStats(body.stats);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const pageSize = PAGINATION.ADMIN_TABLE_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold text-balance">{ADMIN_VIEW.TITLE}</h1>
          <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
            <EyeIcon className="size-3" />
            {ADMIN_VIEW.READ_ONLY}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">{ADMIN_VIEW.DESCRIPTION}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={ADMIN_VIEW.STAT_TOTAL} value={stats && stats.total} icon={CalendarCheckIcon} />
        <StatCard label={ADMIN_VIEW.STAT_UPCOMING} value={stats && stats.upcoming} icon={ClockIcon} />
        <StatCard label={ADMIN_VIEW.STAT_STUDENTS} value={stats && stats.students} icon={UsersIcon} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{ADMIN_VIEW.RECORDS_TITLE}</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  placeholder={ADMIN_VIEW.SEARCH_PLACEHOLDER}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pr-8 pl-8 sm:w-64"
                />
                {query && (
                  <button
                    type="button"
                    aria-label={ADMIN_VIEW.CLEAR_SEARCH}
                    onClick={() => setQuery('')}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                  >
                    <XIcon className="size-4" />
                  </button>
                )}
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as AdminStatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-40" size="default">
                  <SelectValue placeholder={ADMIN_VIEW.STATUS_PLACEHOLDER} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={STATUS_FILTER_ALL}>{ADMIN_VIEW.ALL_STATUSES}</SelectItem>
                    {Object.values(CONSULTATION_STATUS).map((status) => (
                      <SelectItem key={status} value={status}>
                        {CONSULTATION_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                aria-label={ADMIN_VIEW.REFRESH}
                onClick={reload}
                disabled={isLoading}
              >
                <RotateCwIcon className={isLoading ? 'animate-spin' : undefined} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: PAGINATION.ADMIN_TABLE_PAGE_SIZE }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <Empty className="border-destructive/30 border">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
                  <TriangleAlertIcon />
                </EmptyMedia>
                <EmptyTitle>{ADMIN_VIEW.ERROR_TITLE}</EmptyTitle>
                <EmptyDescription>{ADMIN_VIEW.ERROR_DESCRIPTION}</EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" onClick={reload}>
                <RotateCwIcon data-icon="inline-start" />
                {ADMIN_VIEW.RETRY}
              </Button>
            </Empty>
          )}

          {!isLoading && !error && consultations.length === 0 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle>{ADMIN_VIEW.EMPTY_TITLE}</EmptyTitle>
                <EmptyDescription>{ADMIN_VIEW.EMPTY_DESCRIPTION}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !error && consultations.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ADMIN_VIEW.HEAD_STUDENT}</TableHead>
                    <TableHead>{ADMIN_VIEW.HEAD_REASON}</TableHead>
                    <TableHead>{ADMIN_VIEW.HEAD_DATE}</TableHead>
                    <TableHead>{ADMIN_VIEW.HEAD_TIME}</TableHead>
                    <TableHead>{ADMIN_VIEW.HEAD_STATUS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">
                              {`${consultation.firstName[0] ?? ''}${consultation.lastName[0] ?? ''}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{consultation.studentName}</span>
                            <span className="text-muted-foreground text-xs">{consultation.studentEmail}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs whitespace-normal">
                        {consultation.reason}
                      </TableCell>
                      <TableCell>{formatDate(consultation.datetime)}</TableCell>
                      <TableCell>{formatTime(consultation.datetime)}</TableCell>
                      <TableCell>
                        <StatusBadge status={consultation.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between pt-4">
                <span className="text-muted-foreground text-sm">
                  {ADMIN_VIEW.PAGE} {page} {ADMIN_VIEW.PAGE_OF} {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeftIcon data-icon="inline-start" />
                    {ADMIN_VIEW.PREVIOUS}
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    {ADMIN_VIEW.NEXT}
                    <ChevronRightIcon data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
