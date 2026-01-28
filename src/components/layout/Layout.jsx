// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '@store/authStore';

// /**
//  * Public Route Wrapper
//  * For routes like login/register
//  * Redirects to dashboard if already authenticated
//  */
// function PublicRoute() {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   if (isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <Outlet />;
// }

// export default PublicRoute;


import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useUIStore } from '@store/uiStore';

/**
 * Main Layout Component
 * Wraps authenticated pages with Header, Sidebar, and Footer
 */
const Layout = ({ children }) => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-primary-grey-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
          }`}
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;