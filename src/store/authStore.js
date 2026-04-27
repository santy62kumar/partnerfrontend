// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       // State  
//       user: null,
//       token: null,
//       isAuthenticated: false,
//       phoneNumber: null,

//       // Actions
//       setUser: (user) => set({ 
//         user, 
//         isAuthenticated: true 
//       }),

//       setToken: (token) => set({ token }),

//       setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

//       updateUser: (userData) => set((state) => ({
//         user: { ...state.user, ...userData },
//       })),

//       logout: () => {
//         // Clear all auth data
//         set({
//           user: null,
//           token: null,
//           isAuthenticated: false,
//           phoneNumber: null,
//         });
//       },

//       // Getters
//       getUser: () => get().user,
//       getToken: () => get().token,
//       isLoggedIn: () => get().isAuthenticated,
//     }),
//     {
//       name: 'auth-storage', // localStorage key
//       partialize: (state) => ({
//         // Only persist these fields
//         user: state.user,
//         token: state.token,
//         isAuthenticated: state.isAuthenticated,
//         phoneNumber: state.phoneNumber,
//       }),
//     }
//   )
// );


import { create } from 'zustand';

const USER_PROFILE_KEY = 'cached-user-profile';

export const useAuthStore = create((set) => ({
  user: null,
  phoneNumber: null,
  isAuthenticated: false,
  isAuthResolved: false,   

  /** Restore cached user from localStorage — called once at startup */
  hydrateUser: () => {
    try {
      const cached = localStorage.getItem(USER_PROFILE_KEY);
      if (cached) {
        const user = JSON.parse(cached);
        set({ user, isAuthenticated: true, isAuthResolved: true });
        return user;
      }
    } catch {
      // corrupt cache — ignore
    }
    return null;
  },

  setUser: (user) => {
    // Persist to localStorage for next startup
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
    } catch { /* quota exceeded — ignore */ }
    set({
      user,
      isAuthenticated: true,
      isAuthResolved: true,
    });
  },

  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

  clearAuth: () =>
    set(() => {
      localStorage.removeItem('auth-token');
      localStorage.removeItem(USER_PROFILE_KEY);
      return {
        user: null,
        phoneNumber: null,
        isAuthenticated: false,
        isAuthResolved: true,
      };
    }),
}));
