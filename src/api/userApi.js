import httpClient from '../services/httpClient';

/**
 * User Management API Client
 */
export const userApi = {
  /**
   * Retrieves all users scoped to authenticated company.
   * @param {Object} [params]
   * @returns {Promise<{ success: boolean, users: Array }>}
   */
  async listUsers(params = {}) {
    const response = await httpClient.get('/users', { params });
    return response.data;
  },

  /**
   * Retrieves a single user by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, user: Object }>}
   */
  async getUser(id) {
    const response = await httpClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Provisions a new user within the company.
   * @param {Object} data - { name, email, password, roleId, isActive }
   * @returns {Promise<{ success: boolean, user: Object }>}
   */
  async createUser(data) {
    const response = await httpClient.post('/users', data);
    return response.data;
  },

  /**
   * Updates an existing user.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<{ success: boolean, user: Object }>}
   */
  async updateUser(id, data) {
    const response = await httpClient.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Deactivates a user.
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteUser(id) {
    const response = await httpClient.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Toggles user active/inactive status.
   * @param {string} id
   * @param {boolean} isActive
   * @returns {Promise<{ success: boolean, user: Object }>}
   */
  async toggleStatus(id, isActive) {
    const response = await httpClient.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },
};

export default userApi;
