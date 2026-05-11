import { useState, useEffect, useCallback, useRef } from 'react';
import { getEntriesByYear, getEntriesByDate } from '../services/entryService';
import { getErrorMessage } from '../utils/errorUtils';

export function useYearEntries(year) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const data = await getEntriesByYear(year);
      if (requestId !== requestIdRef.current) return;
      setEntries(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('[FIRESTORE_READ_ERROR] getEntriesByYear:', getErrorMessage(err));
      // Don't surface this to the user — calendar stays empty
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetch(); }, [fetch]);

  const datesWithContent = new Set(
    (Array.isArray(entries) ? entries : [])
      .map((e) => e?.date)
      .filter(Boolean)
  );
  return { entries, datesWithContent, loading, refresh: fetch };
}

export function useDayEntries(dateKey) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (!dateKey) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getEntriesByDate(dateKey);
      if (requestId !== requestIdRef.current) return;
      setEntries(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('[FIRESTORE_READ_ERROR] getEntriesByDate:', getErrorMessage(err));
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, [dateKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { entries, loading, refresh: fetch };
}
