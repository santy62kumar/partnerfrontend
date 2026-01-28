import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  IoHomeOutline, 
  IoCheckmarkCircleOutline,
  IoClose,
  IoDocumentTextOutline,
  IoTimeOutline 
} from 'react-icons/io5';
import { useUIStore } from '@store/uiStore';

/**
 * Sidebar Component
 * Navigation menu for the application
 */
const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: IoHomeOutline,
    },
    {
      name: 'Verification',
      path: '/verification',
      icon: IoCheckmarkCircleOutline,
    },
    {
      name: 'Site Requisites',
      path: '/site-requisite',
      icon: IoDocumentTextOutline,
    },
    {
      name: 'Site Requisites History',
      path: '/site-requisite-history',
      icon: IoTimeOutline,
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50 
          transition-transform duration-300 w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]
        `}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between p-4 border-b border-primary-grey-200 lg:hidden">
          <h2 className="text-lg font-semibold font-montserrat">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-primary-grey-100 rounded-lg transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#3D1D1C] text-white'
                        : 'text-primary-grey-700 hover:bg-primary-grey-100'
                    }`
                  }
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
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