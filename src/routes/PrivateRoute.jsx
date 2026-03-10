import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import Layout from '@components/layout/Layout';
import LoadingSpinner from '@components/common/LoadingSpinner';

/**
 * Private Route Wrapper
 * Protects routes that require authentication
 * Redirects to login if not authenticated
 * Redirects to verification if not fully verified
 */
function PrivateRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthResolved) {
    return <LoadingSpinner message="Restoring session..." />;
  }

  // 1) Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2) Allow verification page without redirect
  const isVerificationPage = location.pathname === "/verification";

  // 3) If user is not fully verified and NOT on verification page, redirect to verification
  if (!isVerificationPage && user) {
    const isFullyVerified =
      user.is_verified === true &&
      user.is_pan_verified === true &&
      user.is_bank_details_verified === true &&
      user.is_id_verified === true;

    if (!isFullyVerified) {
      return <Navigate to="/verification" replace />;
    }
  }

  // 4) All good – render UI
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default PrivateRoute;
