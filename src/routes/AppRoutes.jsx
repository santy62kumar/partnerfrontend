import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import React, { useEffect } from 'react';

import { authApi } from '../api/authApi';
import { useAuthStore } from '@store/authStore';
import LoadingSpinner from '@components/common/LoadingSpinner';

// Pages are split per route: a partner on site loads the screen they opened, not the whole app.
const RegisterPage = React.lazy(() => import('@pages/auth/RegisterPage'));
const LoginPage = React.lazy(() => import('@pages/auth/LoginPage'));
const OTPPage = React.lazy(() => import('@pages/auth/OTPPage'));
const VerificationPage = React.lazy(() => import('@pages/verification/VerificationPage'));
const DashboardPage = React.lazy(() => import('@pages/dashboard/DashboardPage'));
const JobDetailPage = React.lazy(() => import('@pages/dashboard/JobDetailPage'));
const NotFoundPage = React.lazy(() => import('@pages/NotFoundPage'));
const ChecklistPage = React.lazy(() => import('@components/Checklist/ChecklistPage'));
const SiteRequisitePage = React.lazy(() => import('../pages/SiteRequisitePage'));
const SiteRequisiteReviewPage = React.lazy(() => import('../pages/SiteRequisiteReviewPage'));
const HistoryPage = React.lazy(() => import('../pages/HistoryPage'));
const SiteGRNPage = React.lazy(() => import('../pages/SiteGRNPage'));
const AttendancePage = React.lazy(() => import('../pages/AttendancePage'));
const DailyReportPage = React.lazy(() => import('../pages/DailyReportPage'));
const RosterPage = React.lazy(() => import('../pages/RosterPage'));


function AppRoutes() {
  useEffect(() => {
    const hydrateSession = async () => {
      const { setUser, clearAuth, hydrateUser } = useAuthStore.getState();

      // Phase 1: Instant restore from cache (synchronous)
      const cachedUser = hydrateUser();

      // Background verify — refresh the profile silently
      const verifyInBackground = async () => {
        try {
          const verifyRes = await authApi.verifyToken();
          if (verifyRes.valid) {
            setUser(await authApi.me());
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      };

      if (cachedUser) {
        // UI is already showing — verify silently (don't block)
        verifyInBackground();
      } else {
        // No cache (first login) — must wait, with timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timed out')), 6000)
        );
        try {
          await Promise.race([verifyInBackground(), timeoutPromise]);
        } catch {
          clearAuth();
        }
      }
    };

    hydrateSession();
  }, []);

  return (
    <BrowserRouter>
      <React.Suspense fallback={<LoadingSpinner message="Loading…" />}>
        <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/jobs/:id" element={<JobDetailPage />} />
          <Route
            path="/dashboard/jobs/:jobId/checklist/:checklistId"
            element={<ChecklistPage />}
          />
          <Route path="/site-requisite" element={<SiteRequisitePage />} />
          <Route path="/site-requisite/review" element={<SiteRequisiteReviewPage />} />
          <Route path="/site-requisite-history" element={<HistoryPage />} />
          <Route path="/site-grn" element={<SiteGRNPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/roster" element={<RosterPage />} />
          <Route path="/daily-report" element={<DailyReportPage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
