// API Base URL
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://adminapi.modula.in/api/v1';

// Backward compatibility: some envs still point to .../api/v1/auth.
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '').replace(/\/auth$/, '');

// App Info
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Modula ';

// Job Status
export const JOB_STATUS = {
  CREATED: 'created',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused',
};

// Job Status Labels
export const JOB_STATUS_LABELS = {
  [JOB_STATUS.CREATED]: 'Created',
  [JOB_STATUS.IN_PROGRESS]: 'In Progress',
  [JOB_STATUS.COMPLETED]: 'Completed',
  [JOB_STATUS.PAUSED]: 'Paused',
};

// Job Status Colors (Tailwind classes)
export const JOB_STATUS_COLORS = {
  [JOB_STATUS.CREATED]: 'status-pill status-pill-created',
  [JOB_STATUS.IN_PROGRESS]: 'status-pill status-pill-in-progress',
  [JOB_STATUS.COMPLETED]: 'status-pill status-pill-completed',
  [JOB_STATUS.PAUSED]: 'status-pill status-pill-paused',
};

// Verification Steps
export const VERIFICATION_STEPS = {
  PAN: 'pan',
  BANK: 'bank',
  DOCUMENT: 'document',
};

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  PHONE_NUMBER: 'phone_number',
};

// Routes
export const ROUTES = {
  REGISTER: '/register',
  LOGIN: '/login',
  VERIFY_OTP: '/verify-otp',
  VERIFICATION: '/verification',
  DASHBOARD: '/dashboard',
  JOB_DETAIL: '/dashboard/jobs/:id',
};
