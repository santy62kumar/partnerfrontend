import axios from 'axios';
import { API_BASE_URL } from '@utils/constants';
import { useAuthStore } from '@store/authStore';
import Cookies from 'js-cookie';

const CSRF_COOKIE_NAMES = ['csrf_token', 'csrftoken', 'XSRF-TOKEN'];
const MUTATING_METHODS = ['post', 'put', 'patch', 'delete'];

const getCsrfToken = () => {
  for (const name of CSRF_COOKIE_NAMES) {
    const token = Cookies.get(name);
    if (token) return token;
  }
  return null;
};

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

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach CSRF token to all state-changing requests
    if (MUTATING_METHODS.includes(config.method?.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
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
  async (error) => {
    const originalRequest = error.config;
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
      return Promise.reject({
        message: 'Request timed out. please try again in a moment.',
      });
    }

    if (error.response) {
      const { status, data } = error.response;
      const message = getErrorMessage(data);

      if (status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh-token') && !originalRequest.url.includes('/auth/verify-otp')) {
        originalRequest._retry = true;
        try {
          await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
          return apiClient(originalRequest);
        } catch {
          useAuthStore.getState().clearAuth();
        }
      } else if (status === 401) {
        useAuthStore.getState().clearAuth();
      }

      return Promise.reject({ status, message, data });
    } else if (error.request) {
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      return Promise.reject({ message: error.message || 'An unexpected error occurred' });
    }
  }
);

export default apiClient;
