import apiClient from './axiosConfig';

export const authApi = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', {
      phone_number: userData.phoneNumber,
      first_name: userData.firstName,
      last_name: userData.lastName,
      city: userData.city,
      pincode: userData.pincode,
    });
    return response.data;
  },

  // Login with phone number
  login: async (phoneNumber) => {
    const response = await apiClient.post('/auth/login', {
      phone_number: phoneNumber,
    });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (phoneNumber, otp) => {
    const response = await apiClient.post('/auth/verify-otp', {
      phone_number: phoneNumber,
      otp: otp,
    });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (phoneNumber) => {
    const response = await apiClient.post('/auth/resend-otp', {
      phone_number: phoneNumber,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
