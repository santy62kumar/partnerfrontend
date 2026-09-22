import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import React, { useEffect, useState } from 'react';
import Button from '@components/common/Button';
import Card from '@components/common/Card';

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
  const [sessionError, setSessionError] = useState(false);
  const [sessionAttempt, setSessionAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const { setUser, clearAuth, clearLegacyStorage } = useAuthStore.getState();
    clearLegacyStorage();
    // /me both verifies the session and returns the profile: one request, no cached identity.
    authApi.me().then((user) => {
      if (active) setUser(user);
    }).catch((error) => {
      if (!active) return;
      if (error.status === 401 || error.status === 403) clearAuth();
      else setSessionError(true);
    });
    return () => { active = false; };
  }, [sessionAttempt]);

  if (sessionError) {
    return (
      <div className="auth-page">
        <Card className="auth-container" padding="p-6 space-y-4">
          <div role="alert">
          <h1 className="text-xl font-semibold">Could not connect</h1>
          <p>Check your internet connection, then try again. You do not need to register again.</p>
          </div>
          <Button onClick={() => { setSessionError(false); setSessionAttempt((attempt) => attempt + 1); }}>
            Try again
          </Button>
        </Card>
      </div>
    );
  }

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
