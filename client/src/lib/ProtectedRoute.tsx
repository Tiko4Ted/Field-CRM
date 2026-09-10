import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import LoadingState from './LoadingState';
import { useSlowLoading } from './useSlowLoading';

export default function ProtectedRoute() {
  const { token, isLoading } = useAuth();
  const isSlow = useSlowLoading(isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState
          isSlow={isSlow}
          title="Checking session..."
          slowDescription="Your database may be waking up while we verify your session."
        />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
