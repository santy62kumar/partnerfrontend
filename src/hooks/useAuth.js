// import { useAuthStore } from '@store/authStore';
// import { authApi } from '@api/authApi';
// import { verificationApi } from '@api/verificationApi';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// export const useAuth = () => {
//   const navigate = useNavigate();
//   const {
//     user,
//     token,
//     isAuthenticated,
//     phoneNumber,
//     setUser,
//     setToken,
//     setPhoneNumber,
//     logout: clearAuth,
//   } = useAuthStore();

//   // Register user
//   const register = async (userData) => {
//     try {
//       const response = await authApi.register(userData);
//       setPhoneNumber(userData.phoneNumber);
//       toast.success('Registration successful! Please login.');
//       navigate('/login');
//       return { success: true, data: response };
//     } catch (error) {
//       const message = error.message || 'Registration failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   // Login user
//   const login = async (phoneNumber) => {
//     try {
//       const response = await authApi.login(phoneNumber);
//       setPhoneNumber(phoneNumber);
//       toast.success('OTP sent successfully!');
//       navigate('/verify-otp');
//       return { success: true, data: response };
//     } catch (error) {
//       const message = error.message || 'Login failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   // Verify OTP
//   const verifyOtp = async (otp) => {
//     try {
//       const response = await authApi.verifyOtp(phoneNumber, otp);
      
//       // Set token and user data
//       console.log("OTP Verification Response:", response);
//       console.log("Setting token:", response.access_token);
//       setToken(response.access_token);
//       setUser(response.user);
      
//       toast.success('Login successful!');
      
//       // Check verification status
//       const verificationStatus = await verificationApi.getVerificationStatus();
//       console.log("User Verification Status:", verificationStatus);
//       console.log("Navigating based on verification status", verificationStatus.is_verified);
//       console.log("is_pan_verified:", verificationStatus.is_pan_verified);
//       console.log("is_bank_details_verified:", verificationStatus.is_bank_details_verified);

      
//       // Redirect based on verification status
//       if (
//         verificationStatus.is_verified &&
//         verificationStatus.is_pan_verified &&
//         verificationStatus.is_bank_details_verified
//       ) {
//         console.log("Navigating to dashboard");
//         navigate('/dashboard');
      
       
//       } else {
//         console.log("Navigating to verification page");
//         navigate('/verification');
//       }
      
//       return { success: true, data: response };
//     } catch (error) {
//       const message = error.message || 'OTP verification failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   // Resend OTP
//   const resendOtp = async () => {
//     try {
//       const response = await authApi.resendOtp(phoneNumber);
//       toast.success('OTP resent successfully!');
//       return { success: true, data: response };
//     } catch (error) {
//       const message = error.message || 'Failed to resend OTP';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   // Logout user
//   const logout = async () => {
//     try {
//       await authApi.logout();
//       clearAuth();
//       toast.success('Logged out successfully');
//       navigate('/login');
//     } catch (error) {
//       // Even if API call fails, clear local auth
//       clearAuth();
//       navigate('/login');
//     }
//   };

//   return {
//     user,
//     token,
//     isAuthenticated,
//     phoneNumber,
//     register,
//     login,
//     verifyOtp,
//     resendOtp,
//     logout,
//   };
// };

import { useAuthStore } from '@store/authStore';
import { authApi } from '@api/authApi';
import { verificationApi } from '@api/verificationApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCallback } from 'react';

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    token,
    isAuthenticated,
    phoneNumber,
    setUser,
    // setToken,
    setPhoneNumber,
    clearAuth,
  } = useAuthStore();

  // Register user
  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      setPhoneNumber(userData.phoneNumber);
      toast.success('Registration successful! Please login.');
      navigate('/login');
      return { success: true, data: response };
    } catch (error) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Login user
  const login = async (phoneNumber) => {
    try {
      const response = await authApi.login(phoneNumber);
      console.log("Login Response:", response);
      setPhoneNumber(phoneNumber);
      toast.success('OTP sent successfully!');
      navigate('/verify-otp');
      return { success: true, data: response };
    } catch (error) {
      const message = error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

 

  const verifyOtp = useCallback(async (otp) => {
    try {
      const response = await authApi.verifyOtp(phoneNumber, otp);
      console.log("📥 Full OTP Response:", response);
      
      const token = response.token;
      console.log("🔑 Extracted Token:", token ? token.substring(0, 30) + '...' : 'NO TOKEN');

      if (token) {
        // ✅ Save to localStorage
        localStorage.setItem('auth-token', token);
        console.log('✅ Token saved to localStorage');
        
        // ✅ VERIFY it was saved
        const savedToken = localStorage.getItem('auth-token');
        console.log('✅ Verified saved token:', savedToken ? savedToken.substring(0, 30) + '...' : 'NOT FOUND');
      } else {
        console.error('⚠️ No token found in response:', response);
      }
      
      // Set token and user data
      setUser(response.user);
      
      toast.success('Login successful!');
      
      // Check if user data already has verification flags
      if (response.user) {
        const isFullyVerified = 
          response.user.is_verified === true &&
          response.user.is_pan_verified === true &&
          response.user.is_bank_details_verified === true;
        
        if (isFullyVerified) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/verification', { replace: true });
        }
      } else {
        // Fallback: navigate to verification
        navigate('/verification', { replace: true });
      }
      
      return { success: true, data: response };
    } catch (error) {
      const message = error.message || 'OTP verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [phoneNumber, setUser, navigate]);

  // Resend OTP
  const resendOtp = async () => {
    try {
      const response = await authApi.resendOtp(phoneNumber);
      toast.success('OTP resent successfully!');
      return { success: true, data: response };
    } catch (error) {
      const message = error.message || 'Failed to resend OTP';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authApi.logout();
      clearAuth();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      // Even if API call fails, clear local auth
      clearAuth();
      navigate('/login');
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    phoneNumber,
    register,
    login,
    verifyOtp,
    resendOtp,
    logout,
  };
};