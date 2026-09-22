import httpClient from '../services/httpClient';

/**
 * Services Management API Client
 */
export const servicesApi = {
  /**
   * Retrieves all services scoped to the authenticated company.
   * @param {Object} [params] - { search, isActive }
   * @returns {Promise<{ success: boolean, services: Array }>}
   */
  async listServices(params = {}) {
    const response = await httpClient.get('/services', { params });
    return response.data;
  },

  /**
   * Retrieves single service profile by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, service: Object }>}
   */
  async getService(id) {
    const response = await httpClient.get(`/services/${id}`);
    return response.data;
  },

  /**
   * Creates a new service.
   * @param {Object} data - { name, description, durationInMinutes, price, isActive }
   * @returns {Promise<{ success: boolean, service: Object, message: string }>}
   */
  async createService(data) {
    const response = await httpClient.post('/services', data);
    return response.data;
  },

  /**
   * Updates an existing service record.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<{ success: boolean, service: Object, message: string }>}
   */
  async updateService(id, data) {
    const response = await httpClient.put(`/services/${id}`, data);
    return response.data;
  },

  /**
   * Soft deletes a service (sets isActive = false).
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, service: Object }>}
   */
  async deleteService(id) {
    const response = await httpClient.delete(`/services/${id}`);
    return response.data;
  },

  /**
   * Toggles service active/inactive status.
   * @param {string} id
   * @returns {Promise<{ success: boolean, service: Object, message: string }>}
   */
  async toggleStatus(id) {
    const response = await httpClient.patch(`/services/${id}/status`);
    return response.data;
  },
};
