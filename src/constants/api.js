/**
 * Centralized API Endpoints Configuration (Label/Value Pattern)
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: {
      label: 'Login',
      value: '/auth/login',
    },
    ME: {
      label: 'Current User',
      value: '/auth/me',
    },
    LOGOUT: {
      label: 'Logout',
      value: '/auth/logout',
    },
  },
  DASHBOARD: {
    SUMMARY: {
      label: 'Dashboard Summary',
      value: '/dashboard/summary',
    },
  },
  ADMIN: {
    DASHBOARD_SUMMARY: {
      label: 'Admin Dashboard Summary',
      value: '/admin/dashboard/summary',
    },
  },
};
