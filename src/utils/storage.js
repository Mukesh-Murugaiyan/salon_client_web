/**
 * Centralized Token & Session Storage Abstraction.
 *
 * Encapsulates client-side token storage to avoid leaking direct localStorage access
 * across UI components, and simplifies future migration to HttpOnly cookie sessions.
 */

const TOKEN_KEY = 'salon_crm_auth_token';

export const storage = {
  /**
   * Retrieves the stored JWT authentication token.
   * @returns {string|null}
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (err) {
      console.error('[Storage] Error reading token from storage:', err);
      return null;
    }
  },

  /**
   * Stores the JWT authentication token.
   * @param {string} token
   */
  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (err) {
      console.error('[Storage] Error saving token to storage:', err);
    }
  },

  /**
   * Removes the stored JWT token.
   */
  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error('[Storage] Error removing token from storage:', err);
    }
  },
};

export default storage;
