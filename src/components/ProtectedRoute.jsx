import { useAuth } from '../hooks/useAuth';
import LoginPage from './LoginPage';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPage />;
  return children;
}
