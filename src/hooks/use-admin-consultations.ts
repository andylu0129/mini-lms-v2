'use client';

import { QUERY_PARAMS } from '@/constants/query-params';
import { API_ROUTES } from '@/constants/routes';
import { VALIDATION } from '@/constants/validation';
import { useCallback, useEffect, useRef, useState } from 'react';

// One page of the admin consultations table, refetched whenever the page,
// status filter or search term changes.
export function useAdminConsultations({
  page,
  status,
  search,
}: {
  page: number;
  status: AdminStatusFilter;
  search: string;
}) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Guards against out-of-order responses when inputs change mid-request.
  const generationRef = useRef(0);

  const load = useCallback(async () => {
    const generation = ++generationRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        [QUERY_PARAMS.PAGE]: String(page),
        [QUERY_PARAMS.STATUS]: status,
      });
      if (search) {
        params.set(QUERY_PARAMS.SEARCH, search);
      }
      const response = await fetch(`${API_ROUTES.ADMIN_CONSULTATIONS}?${params}`);
      const body = await response.json().catch(() => null);
      if (generation !== generationRef.current) {
        return;
      }
      if (!response.ok) {
        setError(body?.error ?? VALIDATION.SERVER_ERROR);
        return;
      }
      setConsultations(body?.consultations ?? []);
      setTotal(body?.total ?? 0);
    } catch {
      if (generation === generationRef.current) {
        setError(VALIDATION.SERVER_ERROR);
      }
    } finally {
      if (generation === generationRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, status, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return { consultations, total, isLoading, error, reload: load };
}
