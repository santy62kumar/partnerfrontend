import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import React, { useEffect } from 'react';

// Pages
import RegisterPage from '@pages/auth/RegisterPage';
import LoginPage from '@pages/auth/LoginPage';
import OTPPage from '@pages/auth/OTPPage';
import VerificationPage from '@pages/verification/VerificationPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import JobDetailPage from '@pages/dashboard/JobDetailPage';
import NotFoundPage from '@pages/NotFoundPage';
import ChecklistPage from '@components/Checklist/ChecklistPage';
import apiClient from '../api/axiosConfig';
import { useAuthStore } from '@store/authStore';
import SiteRequisitePage from '../pages/SiteRequisitePage';
import BucketPage from '../pages/BucketPage';
import SubmitPage from '../pages/SubmitPage';
import HistoryPage from '../pages/HistoryPage';


function AppRoutes() {
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await apiClient.get('/auth/me', { withCredentials: true });
        useAuthStore.getState().setUser(res.data);
      } catch {
        useAuthStore.getState().clearAuth();
      }
    };

    hydrateSession();
  }, []);

  return (
    <BrowserRouter>
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
          {/* <Route path="/" element={<Navigate to="/site-requisite" replace />} /> */}
          <Route path="/site-requisite" element={<SiteRequisitePage />} />
          {/* <Route path="/site-requisite" element={<SiteRequisitePage />} /> */}

        <Route path="/site-requisite/bucket" element={<BucketPage />} />
        <Route path="/site-requisite/bucket/submit" element={<SubmitPage />} />
        <Route path="/site-requisite-history" element={<HistoryPage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
