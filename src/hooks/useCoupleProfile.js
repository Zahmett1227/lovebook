import { useCallback, useEffect, useState } from 'react';
import { getCoupleProfile, updateCoupleProfile } from '../services/coupleService';

export function useCoupleProfile(coupleId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!coupleId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const docSnap = await getCoupleProfile(coupleId);
      setProfile(docSnap);
    } catch (err) {
      console.error('[useCoupleProfile]', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [coupleId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateProfile = useCallback(
    async (data) => {
      if (!coupleId) return;
      setSaving(true);
      try {
        const next = await updateCoupleProfile(coupleId, data);
        setProfile(next);
      } finally {
        setSaving(false);
      }
    },
    [coupleId]
  );

  return { profile, loading, saving, updateProfile, refresh };
}
