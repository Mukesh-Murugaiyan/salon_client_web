/**
 * ApiConfig Class
 * Centralizes API base URL, timeout, and endpoints for the web client.
 */
export class ApiConfig {
  static DEFAULT_PORT = '5000';
  static TIMEOUT_MS = 10000;

  static #currentBaseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    'http://localhost:5000/api';

  /**
   * Returns current active API base URL.
   * @returns {string}
   */
  static getBaseUrl() {
    return this.#currentBaseUrl;
  }

  /**
   * Sets runtime API base URL.
   * @param {string} url
   */
  static setBaseUrl(url) {
    if (!url) return;
    const trimmed = String(url).trim();
    this.#currentBaseUrl = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  }

  /**
   * Centralized endpoint routes
   */
  static ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      ME: '/auth/me',
      LOGOUT: '/auth/logout',
    },
    DASHBOARD: {
      SUMMARY: '/dashboard/summary',
    },
    APPOINTMENTS: {
      LIST: '/appointments',
    },
    SUBSCRIPTION: {
      STATUS: '/subscription/status',
      PLANS: '/plans',
    },
    SALONS: '/salons',
    USERS: '/users',
    ROLES: '/roles',
    STAFF: '/staff',
    CLIENTS: '/clients',
    SERVICES: '/services',
  };
}
