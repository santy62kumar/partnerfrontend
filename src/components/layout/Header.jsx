import React from 'react';
import { IoMenu, IoPersonCircleOutline, IoLogOutOutline } from 'react-icons/io5';
import { useUIStore } from '@store/uiStore';
import { useAuthStore } from '@store/authStore';
import { useAuth } from '@hooks/useAuth';
import { APP_NAME } from '@utils/constants';
import { formatters } from '@utils/formatters';

/**
 * Header Component
 * Shows app name, user info, and logout button
 */
const Header = () => {
  const { toggleSidebar } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu button and App name */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-primary-grey-100 rounded-lg transition-colors lg:hidden"
          >
            <IoMenu size={24} className="text-primary-grey-700" />
          </button>
          
          <div className="flex items-center justify-center rounded-md">
            <img
              src="https://www.modula.in/images/modula_jsw.svg"
              alt="Modula by JSW"
              className="h-10"
            />
          </div>

        </div>

        {/* Right: User info and logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <IoPersonCircleOutline size={24} className="text-primary-grey-600" />
              <div>
                <p className="text-sm font-medium text-primary-grey-900">
                  {formatters.capitalize(`${user.first_name} ${user.last_name}`)}
                </p>
                {/* <p className="text-xs text-primary-grey-500">
                  {formatters.phone(user.phone_number)}
                </p> */}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-red hover:bg-red-50 rounded-lg transition-colors"
          >
            <IoLogOutOutline size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;