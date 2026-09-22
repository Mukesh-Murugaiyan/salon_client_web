import httpClient from '../services/httpClient';

/**
 * Staff Management API Client
 */
export const staffApi = {
  /**
   * Retrieves all staff members scoped to the authenticated company.
   * @param {Object} [params] - { search, isActive, title }
   * @returns {Promise<{ success: boolean, staff: Array }>}
   */
  async listStaff(params = {}) {
    const response = await httpClient.get('/staff', { params });
    return response.data;
  },

  /**
   * Retrieves single staff profile by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, staff: Object }>}
   */
  async getStaff(id) {
    const response = await httpClient.get(`/staff/${id}`);
    return response.data;
  },

  /**
   * Provisions a new staff member.
   * @param {Object} data - { name, phone, email, title, specialization, isActive }
   * @returns {Promise<{ success: boolean, staff: Object, message: string }>}
   */
  async createStaff(data) {
    const response = await httpClient.post('/staff', data);
    return response.data;
  },

  /**
   * Updates an existing staff record.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<{ success: boolean, staff: Object, message: string }>}
   */
  async updateStaff(id, data) {
    const response = await httpClient.put(`/staff/${id}`, data);
    return response.data;
  },

  /**
   * Soft deletes a staff member (sets isActive = false).
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, staff: Object }>}
   */
  async deleteStaff(id) {
    const response = await httpClient.delete(`/staff/${id}`);
    return response.data;
  },

  /**
   * Toggles staff active/inactive status.
   * @param {string} id
   * @param {boolean} isActive
   * @returns {Promise<{ success: boolean, staff: Object, message: string }>}
   */
  async toggleStatus(id, isActive) {
    const response = await httpClient.patch(`/staff/${id}/status`, { isActive });
    return response.data;
  },
};

export default staffApi;
