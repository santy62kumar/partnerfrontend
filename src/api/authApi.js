import { getCurrentUser, login, logout, refreshToken, registerUser, resendOtp, verifyOtp, verifyToken } from './authGeneratedApi';

export const authApi = {
  // Register new user
  register: async (userData) => {
    return registerUser({
      phone_number: userData.phoneNumber,
      first_name: userData.firstName,
      last_name: userData.lastName,
      city: userData.city,
      pincode: userData.pincode,
      is_internal: userData.isInternal || false,
    });
  },

  // Login with phone number
  login,

  verifyOtp,

  resendOtp,

  // Verify Token
  verifyToken,

  // Refresh Token
  refreshToken,

  // Logout
  logout,

  me: getCurrentUser,
};
