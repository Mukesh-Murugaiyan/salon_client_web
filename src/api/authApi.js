import httpClient from '../services/httpClient';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Logs in a user with email and password.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async login(credentials) {
    const response = await httpClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Fetches currently authenticated user context.
   * @returns {Promise<{ user: Object }>}
   */
  async getMe() {
    const response = await httpClient.get('/auth/me');
    return response.data;
  },

  /**
   * Informs backend of logout (stateless token discard).
   * @returns {Promise<{ message: string }>}
   */
  async logout() {
    const response = await httpClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Backend health check.
   * @returns {Promise<{ status: string }>}
   */
  async checkHealth() {
    const response = await httpClient.get('/health');
    return response.data;
  },
};

export default authApi;
