import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckCircle2, X, FileText, Camera, ClipboardList, Package, CalendarDays } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';
import { Button } from '@components/ui/button';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const user = useAuthStore((state) => state.user);
  const ready = user?.is_verified && user?.is_pan_verified && user?.is_bank_details_verified && user?.is_id_verified;

  const menuItems = [
    {
      name: 'Today & my jobs',
      path: '/dashboard',
      icon: Home,
    },
    {
      name: 'Account setup',
      path: '/verification',
      icon: CheckCircle2,
    },
    {
      name: 'Request materials',
      path: '/site-requisite',
      icon: FileText,
    },
    {
      name: 'Check in / Check out',
      path: '/attendance',
      icon: Camera,
    },
    {
      name: 'My schedule',
      path: '/roster',
      icon: CalendarDays,
    },
    {
      name: 'Download report copy',
      path: '/daily-report',
      icon: ClipboardList,
    },
    {
      name: 'Receive deliveries',
      path: '/site-grn',
      icon: Package,
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Primary navigation"
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border shadow-elevated z-50 
          transition-transform duration-300 w-64 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:shadow-none
        `}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <h2 className="text-lg font-semibold font-heading text-foreground">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-5 pt-6 pb-3 hidden lg:block">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            {ready ? 'My work' : 'Getting started'}
          </p>
        </div>

        {!ready && <p className="px-5 pb-4 text-sm text-muted-foreground">Finish account setup to open your jobs and schedule.</p>}

        {/* Navigation Links */}
        <nav className="px-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.filter((item) => ready || item.path === '/verification').map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${isActive
                      ? 'bg-primary/10 text-primary hover:bg-primary/15'
                      : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
