// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '@store/authStore';

// /**
//  * Public Route Wrapper
//  * For routes like login/register
//  * Redirects to dashboard if already authenticated
//  */
// function PublicRoute() {
//   // const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const user = useAuthStore(state => state.user);

//   if (isAuthenticated) {
//     if (
//       !user?.is_verified ||
//       !user?.is_pan_verified ||
//       !user?.is_bank_details_verified
//     ) {
//       return <Navigate to="/verification" replace />;
//     }
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <Outlet />;
// }

// export default PublicRoute;


import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

/**
 * Public Route Wrapper
 * For routes like login/register
 * Redirects to dashboard if already authenticated
 */
function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user) {
    // Check if user is fully verified
    const isFullyVerified = 
      user.is_verified === true &&
      user.is_pan_verified === true &&
      user.is_bank_details_verified === true;
    
    if (!isFullyVerified) {
      return <Navigate to="/verification" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;