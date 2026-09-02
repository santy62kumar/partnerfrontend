import { useAuthStore } from '@store/authStore';
import { authApi } from '@api/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useChecklistStore from '@store/checklistStore';
import { useDashboardStore } from '@store/dashboardStore';
import useRequisiteStore from '@store/requisiteStore';
import { getApiErrorMessage, getApiFieldErrors } from '@api/apiErrors';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    phoneNumber,
    setUser,
    setPhoneNumber,
    clearAuth,
  } = useAuthStore();

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      setPhoneNumber(userData.phoneNumber);
      toast.success('Registration successful! Please login.');
      navigate('/login');
      return { success: true, data: response };
    } catch (error) {
      const message = getApiErrorMessage(error);
      toast.error(message);
      return { success: false, error: message, fieldErrors: getApiFieldErrors(error) };
    }
  };

  const login = async (phoneNumber) => {
    try {
      const response = await authApi.login(phoneNumber);
      setPhoneNumber(phoneNumber);
      toast.success('OTP sent successfully!');
      navigate('/verify-otp');
      return { success: true, data: response };
    } catch (error) {
      const message = getApiErrorMessage(error);
      toast.error(message);
      return { success: false, error: message, fieldErrors: getApiFieldErrors(error) };
    }
  };

  const verifyOtp = useCallback(async (otp) => {
    try {
      const response = await authApi.verifyOtp(phoneNumber, otp);
      const verifiedUser = response?.user || response;
      setUser(verifiedUser);

      toast.success('Login successful!');

      if (verifiedUser) {
        const isFullyVerified =
          verifiedUser.is_verified === true &&
          verifiedUser.is_pan_verified === true &&
          verifiedUser.is_bank_details_verified === true &&
          verifiedUser.is_id_verified === true;

        if (isFullyVerified) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/verification', { replace: true });
        }
      } else {
        navigate('/verification', { replace: true });
      }

      return { success: true, data: response };
    } catch (error) {
      const message = getApiErrorMessage(error);
      toast.error(message);
      return { success: false, error: message, fieldErrors: getApiFieldErrors(error) };
    }
  }, [phoneNumber, setUser, navigate]);

  const resendOtp = async () => {
    try {
      const response = await authApi.resendOtp(phoneNumber);
      toast.success('OTP resent successfully!');
      return { success: true, data: response };
    } catch (error) {
      const message = getApiErrorMessage(error);
      toast.error(message);
      return { success: false, error: message, fieldErrors: getApiFieldErrors(error) };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      queryClient.clear();
      useChecklistStore.getState().resetStore();
      useDashboardStore.getState().resetDashboard();
      useRequisiteStore.getState().clearBucket();
      clearAuth();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      queryClient.clear();
      useChecklistStore.getState().resetStore();
      useDashboardStore.getState().resetDashboard();
      useRequisiteStore.getState().clearBucket();
      clearAuth();
      navigate('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    phoneNumber,
    register,
    login,
    verifyOtp,
    resendOtp,
    logout,
  };
};
