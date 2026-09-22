import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import { useAuthStore } from './store/authStore'
import useChecklistStore from './store/checklistStore'
import { useDashboardStore } from './store/dashboardStore'
import useRequisiteStore from './store/requisiteStore'
import { useVerificationStore } from './store/verificationStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Clear every account's data on expiry, logout, or account switch.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) {
    queryClient.clear();
    useChecklistStore.getState().resetStore();
    useDashboardStore.getState().resetDashboard();
    useRequisiteStore.getState().clearBucket();
    useVerificationStore.getState().resetVerification();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
