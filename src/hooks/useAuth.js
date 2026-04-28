import { useState, useEffect } from 'react';
import { observeAuthState } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = observeAuthState((u) => setUser(u ?? null));
    return unsub;
  }, []);

  return { user, loading: user === undefined };
}
