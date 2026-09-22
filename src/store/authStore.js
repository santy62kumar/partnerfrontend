import { create } from 'zustand';

// Clean up older versions that stored profiles and bearer tokens on shared devices.
const clearLegacyStorage = () => {
  try {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('cached-user-profile');
    localStorage.removeItem('auth-storage');
  } catch { /* Storage can be unavailable in private browsing. */ }
};

export const useAuthStore = create((set) => ({
  user: null,
  phoneNumber: null,
  isAuthenticated: false,
  isAuthResolved: false,

  clearLegacyStorage,

  setUser: (user) => {
    clearLegacyStorage();
    // OTP responses also serve mobile clients; browser auth stays in HttpOnly cookies.
    const profile = { ...user };
    delete profile.access_token;
    delete profile.refresh_token;
    delete profile.token_type;
    set({ user: profile, isAuthenticated: true, isAuthResolved: true });
  },

  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

  clearAuth: () => {
    clearLegacyStorage();
    set({ user: null, phoneNumber: null, isAuthenticated: false, isAuthResolved: true });
  },
}));
