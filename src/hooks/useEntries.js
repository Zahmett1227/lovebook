import { useState, useEffect, useCallback, useRef } from 'react';
import { getEntriesByYear, getEntriesByDate } from '../services/entryService';
import { getErrorMessage, firestoreUserMessage } from '../utils/errorUtils';

export function useYearEntries(year) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const requestIdRef = useRef(0);

  const fetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getEntriesByYear(year);
      if (requestId !== requestIdRef.current) return;
      setEntries(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('[FIRESTORE_READ_ERROR] getEntriesByYear:', getErrorMessage(err));
      setLoadError(firestoreUserMessage(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [year]);

  // Veri yükleme: yıl değişince Firestore’dan çek
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- klasik veri yükleme
    void fetch();
  }, [fetch]);

  const datesWithContent = new Set(
    (Array.isArray(entries) ? entries : [])
      .map((e) => e?.date)
      .filter(Boolean)
  );
  return { entries, datesWithContent, loading, loadError, refresh: fetch };
}

export function useDayEntries(dateKey) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const requestIdRef = useRef(0);

  const fetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (!dateKey) {
      setEntries([]);
      setLoadError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getEntriesByDate(dateKey);
      if (requestId !== requestIdRef.current) return;
      setEntries(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('[FIRESTORE_READ_ERROR] getEntriesByDate:', getErrorMessage(err));
      setLoadError(firestoreUserMessage(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [dateKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- klasik veri yükleme
    void fetch();
  }, [fetch]);

  return { entries, loading, loadError, refresh: fetch };
}
