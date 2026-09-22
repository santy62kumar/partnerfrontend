import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import LoadingSpinner from '@components/common/LoadingSpinner';

/**
 * Public Route Wrapper
 * For routes like login/register
 * Redirects to dashboard if already authenticated
 */
function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);

  if (!isAuthResolved) return <LoadingSpinner message="Checking your session…" />;

  if (isAuthenticated && user) {
    // Check if user is fully verified
    const isFullyVerified = 
      user.is_verified === true &&
      user.is_pan_verified === true &&
      user.is_bank_details_verified === true &&
      user.is_id_verified === true;
    
    if (!isFullyVerified) {
      return <Navigate to="/verification" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
