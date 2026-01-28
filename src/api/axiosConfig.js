// import axios from 'axios';
// import { API_BASE_URL } from '@utils/constants';

// // Create axios instance
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 30000, // 30 seconds
// });

// // Request interceptor - Add auth token to every request
// apiClient.interceptors.request.use(
//   (config) => {
//     // Get token from localStorage
//     const authStorage = localStorage.getItem('auth-storage');
//     if (authStorage) {
//       try {
//         const { state } = JSON.parse(authStorage);
//         const token = state?.token;
//         console.log("Token from storage:", token);
        
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//       } catch (error) {
//         console.error('Error parsing auth storage:', error);
//       }
//     }
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle errors globally
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle different error scenarios
//     if (error.response) {
//       // Server responded with error status
//       const { status, data } = error.response;
      
//       switch (status) {
//         case 401:
//           // Unauthorized - Clear auth and redirect to login
//           localStorage.removeItem('auth-storage');
//           window.location.href = '/login';
//           break;
          
//         case 403:
//           // Forbidden
//           console.error('Access forbidden:', data.message);
//           break;
          
//         case 404:
//           // Not found
//           console.error('Resource not found:', data.message);
//           break;
          
//         case 500:
//           // Server error
//           console.error('Server error:', data.message);
//           break;
          
//         default:
//           console.error('Error:', data.message || 'An error occurred');
//       }
      
//       // Return error with message
//       return Promise.reject({
//         status,
//         message: data.message || data.error || 'An error occurred',
//         data,
//       });
//     } else if (error.request) {
//       // Request made but no response
//       console.error('Network error: No response received');
//       return Promise.reject({
//         message: 'Network error. Please check your connection.',
//       });
//     } else {
//       // Something else happened
//       console.error('Error:', error.message);
//       return Promise.reject({
//         message: error.message || 'An unexpected error occurred',
//       });
//     }
//   }
// );

// export default apiClient;


import axios from 'axios';
import { API_BASE_URL } from '@utils/constants';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Send cookies with every request
apiClient.interceptors.request.use(
  (config) => {
    // The browser will automatically include cookies for same-origin requests
    // But if you need to explicitly send credentials for cross-origin requests, 
    // you can add credentials: 'include' to the request config here
    config.withCredentials = true;  // Ensures cookies are sent with cross-origin requests

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - Clear auth and redirect to login
          // No longer need to clear localStorage since the token is stored in a secure cookie
          useAuthStore.getState().clearAuth();
          // window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
          
        default:
          console.error('Error:', data.message || 'An error occurred');
      }
      
      // Return error with message
      return Promise.reject({
        status,
        message: data.detail || data.message || data.error || 'An error occurred',
        data,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response received');
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default apiClient;
