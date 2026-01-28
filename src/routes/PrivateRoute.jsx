// import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { useAuthStore } from '@store/authStore';
// import Layout from '@components/layout/Layout';


// /**
//  * Private Route Wrapper
//  * Protects routes that require authentication
//  * Redirects to login if not authenticated
//  */
// function PrivateRoute() {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const user = useAuthStore((state) => state.user);
//   const location = useLocation();

//   // 1) Not logged in
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // 2) User must be allowed to load "verification" page without redirect
//   const isVerificationPage = location.pathname === "/verification";

//   if (
//     !isVerificationPage && 
//     (
//       !user?.is_verified ||
//       !user?.is_pan_verified ||
//       !user?.is_bank_details_verified
//     )
//   ) {
//     return <Navigate to="/verification" replace />;
//   }

//   // 3) All good ➝ render UI
//   return (
//     <Layout>
//       <Outlet />
//     </Layout>
//   );
// }

// export default PrivateRoute;


import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import Layout from '@components/layout/Layout';

/**
 * Private Route Wrapper
 * Protects routes that require authentication
 * Redirects to login if not authenticated
 */
function PrivateRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  

  // 1) Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2) Allow verification page without redirect
  const isVerificationPage = location.pathname === "/verification";
  
  // 3) If user is not verified and NOT on verification page, redirect to verification
  if (!isVerificationPage && user) {
    const isFullyVerified = 
      user.is_verified === true &&
      user.is_pan_verified === true &&
      user.is_bank_details_verified === true;
    
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


// function PrivateRoute() {
//   const { isAuthenticated, isAuthResolved, user } = useAuthStore();
//   const location = useLocation();

//   // 0️⃣ Still checking session → don’t redirect yet
//   if (!isAuthResolved) {
//     return null; // or loading spinner
//   }

//   // 1️⃣ Not logged in (confirmed)
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // 2️⃣ Allow verification page
//   const isVerificationPage = location.pathname === "/verification";

//   // 3️⃣ Enforce verification
//   if (!isVerificationPage && user) {
//     const isFullyVerified =
//       user.is_verified &&
//       user.is_pan_verified &&
//       user.is_bank_details_verified;

//     if (!isFullyVerified) {
//       return <Navigate to="/verification" replace />;
//     }
//   }

//   // 4️⃣ All good
//   return (
//     <Layout>
//       <Outlet />
//     </Layout>
//   );
// }

// export default PrivateRoute;