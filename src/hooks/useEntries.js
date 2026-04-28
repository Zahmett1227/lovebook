import { useState, useEffect, useCallback } from 'react';
import { getEntriesByYear, getEntriesByDate } from '../services/entryService';

export function useYearEntries(year) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEntriesByYear(year);
      setEntries(data);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getEntriesByYear:', err.message);
      // Don't surface this to the user — calendar stays empty
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetch(); }, [fetch]);

  const datesWithContent = new Set(entries.map((e) => e.date));
  return { entries, datesWithContent, loading, refresh: fetch };
}

export function useDayEntries(dateKey) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!dateKey) return;
    setLoading(true);
    try {
      const data = await getEntriesByDate(dateKey);
      setEntries(data);
    } catch (err) {
      console.error('[FIRESTORE_READ_ERROR] getEntriesByDate:', err.message);
    } finally {
      setLoading(false);
    }
  }, [dateKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { entries, loading, refresh: fetch };
}
