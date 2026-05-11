import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginPage from './LoginPage';
import LoadingSpinner from './LoadingSpinner';

const AUTH_SLOW_MS = 8000;

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [authSlowHint, setAuthSlowHint] = useState(false);

  useEffect(() => {
    if (!loading) {
      const clearId = window.setTimeout(() => setAuthSlowHint(false), 0);
      return () => window.clearTimeout(clearId);
    }
    const id = window.setTimeout(() => setAuthSlowHint(true), AUTH_SLOW_MS);
    return () => window.clearTimeout(id);
  }, [loading]);

  if (loading) {
    return (
      <LoadingSpinner
        message="Oturum kontrol ediliyor…"
        slowHint={authSlowHint}
      />
    );
  }
  if (!user) return <LoginPage />;
  return children;
}
