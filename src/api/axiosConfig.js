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
import { useAuthStore } from '@store/authStore';

const formatValidationErrors = (detail) => {
  if (!Array.isArray(detail)) return null;
  const lines = detail
    .map((item) => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return null;
      const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
      const msg = item.msg || 'Invalid input';
      return field ? `${field}: ${msg}` : msg;
    })
    .filter(Boolean);
  return lines.length ? lines.join(', ') : null;
};

const getErrorMessage = (data) => {
  if (!data) return 'An error occurred';
  if (typeof data === 'string') return data;

  if (data.detail !== undefined) {
    if (typeof data.detail === 'string') return data.detail;
    const validation = formatValidationErrors(data.detail);
    if (validation) return validation;
    if (data.detail && typeof data.detail === 'object' && typeof data.detail.msg === 'string') {
      return data.detail.msg;
    }
  }

  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;

  return 'An error occurred';
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: true,
});

// Request interceptor - Send cookies with every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      const message = getErrorMessage(data);

      switch (status) {
        case 401:
          // Unauthorized - Clear auth and redirect to login
          // No longer need to clear localStorage since the token is stored in a secure cookie
          useAuthStore.getState().clearAuth();
          // window.location.href = '/login';
          break;

        case 403:
          // Forbidden
          console.error('Access forbidden:', message);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', message);
          break;

        case 500:
          // Server error
          console.error('Server error:', message);
          break;

        default:
          console.error('Error:', message);
      }

      // Return error with message
      return Promise.reject({
        status,
        message,
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
