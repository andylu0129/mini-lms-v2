// This runs in the browser, not on the server, it's a React hook, so it needs to be client-side.
'use client';

// Imports: shared constants (URL param names, API paths, error text, so nothing is a hardcoded
// string), two TypeScript types, and React's hook tools.
import { QUERY_PARAMS } from '@/constants/query-params';
import { API_ROUTES } from '@/constants/routes';
import { VALIDATION } from '@/constants/validation';
import type { AdminStatusFilter, Consultation } from '@/types/global';
import { useCallback, useEffect, useRef, useState } from 'react';

// One page of the admin consultations table, refetched whenever the page,
// status filter, or search term changes.
// This is a custom hook. It takes three inputs from whoever calls it (the admin page): the
// current page number, the selected status filter, and the search text. Whenever any of these
// three change, this hook should fetch new data to match.
export function useAdminConsultations({
  page,
  status,
  search,
}: {
  page: number;
  status: AdminStatusFilter;
  search: string;
}) {
  // Four pieces of state, each triggering a re-render when it changes: the list of
  // consultations for the current page, the total number of matching rows (used for
  // page-count math), whether a fetch is currently in progress, and any error message
  // (or null if there isn't one).
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Guards against out-of-order responses when inputs change mid-request.
  // A plain counter that does not cause re-renders when changed (that's what makes useRef
  // different from useState). Its purpose: telling old, slow responses apart from new ones.
  const generationRef = useRef(0);

  // Defines the actual data-fetching function.
  const load = useCallback(async () => {
    // The instant it runs, it bumps the counter by one and remembers its own number, say this
    // fetch is "generation 3." If the admin changes the filter again a second later, a new call
    // to load() bumps the counter to 4. Now there are two fetches in flight: an old one (3) and
    // a new one (4).
    const generation = ++generationRef.current;
    // Turns on the loading state and clears out any leftover error from a previous attempt, so
    // the UI starts clean.
    setIsLoading(true);
    setError(null);
    // Everything below runs inside a try so that network failures don't crash the app, they get
    // caught further down.
    try {
      // Builds the query string that goes on the API URL, e.g. page=2&status=upcoming.
      const params = new URLSearchParams({
        [QUERY_PARAMS.PAGE]: String(page),
        [QUERY_PARAMS.STATUS]: status,
      });
      // The search term is only added if it's non-empty, no point sending search= with
      // nothing in it.
      if (search) {
        params.set(QUERY_PARAMS.SEARCH, search);
      }
      // Sends the actual HTTP request to the admin consultations API, with the query string
      // attached.
      const response = await fetch(`${API_ROUTES.ADMIN_CONSULTATIONS}?${params}`);
      // Tries to parse the response body as JSON. If that fails (e.g. the server sent an empty
      // or broken response), body just becomes null instead of throwing an error.
      const body = await response.json().catch(() => null);
      // The core safety check. By the time this response arrives, has a newer fetch already
      // started (i.e., has the counter moved past this fetch's number)? If so, this response
      // belongs to an outdated request, the admin already changed the search/filter/page
      // again. So just stop here and ignore it, rather than overwriting fresh data with
      // stale data.
      if (generation !== generationRef.current) {
        return;
      }
      // If the server responded with a non-2xx status (like 400 or 500), show whatever error
      // message it provided, or a generic fallback message if it didn't provide one. Then
      // stop, don't try to use the body as real data.
      if (!response.ok) {
        setError(body?.error ?? VALIDATION.SERVER_ERROR);
        return;
      }
      // The happy path: store the returned list of consultations and the total count. The
      // ?? [] / ?? 0 fallbacks protect against a malformed response that's missing those fields.
      setConsultations(body?.consultations ?? []);
      setTotal(body?.total ?? 0);
    } catch {
      // If something threw an actual exception (e.g. no network connection at all), show a
      // generic error message, but only if this fetch is still the current one (same
      // staleness check as before, so an old failed request can't show an error over newer,
      // successful data).
      if (generation === generationRef.current) {
        setError(VALIDATION.SERVER_ERROR);
      }
    } finally {
      // Whether it succeeded or failed, turn off the loading spinner, again only if this is
      // still the latest fetch.
      if (generation === generationRef.current) {
        setIsLoading(false);
      }
    }
    // The dependency list tells React: rebuild this load function whenever page, status, or
    // search changes.
  }, [page, status, search]);

  // This is what actually kicks the fetch off. Since load is a new function every time
  // page/status/search changes, this effect re-runs every time that happens, meaning a new
  // request automatically fires whenever the admin changes the page, filter, or search box.
  useEffect(() => {
    // void just tells TypeScript "I know this returns a Promise, I'm deliberately not
    // awaiting it here."
    void load();
  }, [load]);

  // The hook hands back everything the admin page component needs to render: the rows, the
  // total, the loading/error flags, and it also exposes load under the name reload, so a
  // manual "refresh" button can trigger the exact same fetch again on demand.
  return { consultations, total, isLoading, error, reload: load };
}
