
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useUIStore } from '@store/uiStore';

const Layout = ({ children }) => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] rounded-md bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-card"
      >
        Skip to main content
      </a>
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full transition-all duration-300"
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
