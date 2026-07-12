'use client';

import { QUERY_PARAMS } from '@/constants/query-params';
import { API_ROUTES } from '@/constants/routes';
import { VALIDATION } from '@/constants/validation';
import { ConsultationFilter, Consultation } from '@/types/global';
import { useCallback, useEffect, useRef, useState } from 'react';

// Paginated consultation list for one filter. Fetches the first page when the
// filter changes and the next page whenever the sentinel element (rendered by
// the consumer when hasMore && !isLoading && !error) scrolls into view.
export function useInfiniteConsultations(filter: ConsultationFilter) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bumped on every filter change so responses from a previous filter are discarded.
  const generationRef = useRef(0);
  const offsetRef = useRef(0);
  const inFlightRef = useRef(false);
  // Pins the upcoming/past time boundary for a whole scroll session, so a
  // consultation crossing its start time between pages can't shift the
  // offsets (which would skip or duplicate a row).
  const asOfRef = useRef(new Date().toISOString());

  const fetchPage = useCallback(
    async (generation: number) => {
      inFlightRef.current = true;
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          [QUERY_PARAMS.FILTER]: filter,
          [QUERY_PARAMS.OFFSET]: String(offsetRef.current),
          [QUERY_PARAMS.AS_OF]: asOfRef.current,
        });
        const response = await fetch(`${API_ROUTES.CONSULTATIONS}?${params}`);
        const body = await response.json().catch(() => null);
        if (generation !== generationRef.current) {
          return;
        }
        if (!response.ok) {
          setError(body?.error ?? VALIDATION.SERVER_ERROR);
          return;
        }
        const page: Consultation[] = body?.consultations ?? [];
        offsetRef.current += page.length;
        setConsultations((previous) => [...previous, ...page]);
        setHasMore(Boolean(body?.hasMore));
      } catch {
        if (generation === generationRef.current) {
          setError(VALIDATION.SERVER_ERROR);
        }
      } finally {
        // A newer generation owns the flags once the filter changes.
        if (generation === generationRef.current) {
          inFlightRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [filter],
  );

  // Drop everything and refetch from the first page. Runs on mount, on filter
  // change, and after a mutation (offsets shift once a row changes status).
  const reload = useCallback(() => {
    generationRef.current += 1;
    offsetRef.current = 0;
    asOfRef.current = new Date().toISOString();
    setConsultations([]);
    setHasMore(false);
    void fetchPage(generationRef.current);
  }, [fetchPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadMore = useCallback(() => {
    if (inFlightRef.current || !hasMore || error) {
      return;
    }
    void fetchPage(generationRef.current);
  }, [fetchPage, hasMore, error]);

  const retry = useCallback(() => {
    if (inFlightRef.current) {
      return;
    }
    void fetchPage(generationRef.current);
  }, [fetchPage]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) {
        return;
      }
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
      observer.observe(node);
      observerRef.current = observer;
    },
    [loadMore],
  );

  return { consultations, isLoading, hasMore, error, sentinelRef, retry, reload };
}
