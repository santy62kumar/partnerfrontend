import React, { useState } from 'react';
import { Menu, LogOut, Trash2 } from 'lucide-react';
import { useUIStore } from '@store/uiStore';
import { useAuthStore } from '@store/authStore';
import { useAuth } from '@hooks/useAuth';
import { formatters } from '@utils/formatters';
import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import Modal from '@components/common/Modal';
import { verificationApi } from '@api/verificationApi';
import { useVerificationStore } from '@store/verificationStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = () => {
  const { toggleSidebar } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const resetVerification = useVerificationStore((state) => state.resetVerification);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteVerificationModal, setShowDeleteVerificationModal] = useState(false);
  const [deletingVerification, setDeletingVerification] = useState(false);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  const fallbackName = user?.name || user?.email || formatters.phone(user?.phone_number) || 'User';

  const getInitials = () => {
    if (user?.first_name && user?.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    if (fullName) {
      const parts = fullName.split(' ').filter(Boolean);
      if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return fullName.slice(0, 2).toUpperCase();
    }
    return String(fallbackName).slice(0, 2).toUpperCase();
  };
  const initials = getInitials();

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleDeleteVerification = async () => {
    setDeletingVerification(true);
    try {
      await verificationApi.deleteVerificationData();
      resetVerification();
      setUser({
        ...user,
        is_pan_verified: false,
        is_bank_details_verified: false,
        is_id_verified: false,
      });
      setShowDeleteVerificationModal(false);
      toast.success('Verification data deleted');
      navigate('/verification', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to delete verification data');
    } finally {
      setDeletingVerification(false);
    }
  };

  return (
    <>
      <header className="surface-glass sticky top-0 z-40 border-b border-border/80">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          {/* Left: Menu button and App name */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <img
                src="/splash-icon.png"
                alt="Modula by JSW"
                className="h-9 w-auto"
              />
              <div className="hidden md:block">
                
              </div>
            </div>
          </div>

          {/* Right: User profile dropdown */}
          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{fullName ? formatters.capitalize(fullName) : fallbackName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {formatters.phone(user?.phone_number)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowDeleteVerificationModal(true)} className="text-destructive focus:text-destructive cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete verification data</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Are you sure you want to logout?
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteVerificationModal}
        onClose={() => !deletingVerification && setShowDeleteVerificationModal(false)}
        title="Delete verification data"
        size="sm"
      >
        <p className="mb-6 text-sm text-muted-foreground">
          This permanently removes your PAN, bank details and uploaded verification documents. You will need to verify again.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteVerificationModal(false)} disabled={deletingVerification}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteVerification} disabled={deletingVerification}>
            {deletingVerification ? 'Deleting…' : 'Delete data'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Header;
