import httpClient from '../services/httpClient';

/**
 * Salons Management API Client
 * Used for platform-level multi-tenant management.
 */
export const salonsApi = {
  /**
   * Retrieves all salons (paginated).
   * @param {Object} [params] - { search, isActive, page, limit }
   * @returns {Promise<{ success: boolean, salons: Array, total: number, page: number, totalPages: number }>}
   */
  async listSalons(params = {}) {
    const response = await httpClient.get('/salons', { params });
    return response.data;
  },

  /**
   * Retrieves single salon profile by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, salon: Object }>}
   */
  async getSalon(id) {
    const response = await httpClient.get(`/salons/${id}`);
    return response.data;
  },

  /**
   * Provisions a new salon tenant.
   * @param {Object} data
   * @returns {Promise<{ success: boolean, salon: Object, message: string }>}
   */
  async createSalon(data) {
    const response = await httpClient.post('/salons', data);
    return response.data;
  },

  /**
   * Updates an existing salon record.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<{ success: boolean, salon: Object, message: string }>}
   */
  async updateSalon(id, data) {
    const response = await httpClient.put(`/salons/${id}`, data);
    return response.data;
  },

  /**
   * Toggles salon active/inactive status.
   * @param {string} id
   * @param {boolean} isActive
   * @returns {Promise<{ success: boolean, salon: Object, message: string }>}
   */
  async toggleStatus(id, isActive) {
    const response = await httpClient.patch(`/salons/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Super Admin Assign/Upgrade Subscription
   * @param {string} id
   * @param {Object} data - { planId, startDate }
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async manageSubscription(id, data) {
    const response = await httpClient.post(`/salons/${id}/subscription`, data);
    return response.data;
  },

  /**
   * Super Admin Renew Subscription
   * @param {string} id
   * @param {Object} data - { startDate }
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async renewSubscription(id, data) {
    const response = await httpClient.post(`/salons/${id}/subscription/renew`, data);
    return response.data;
  },

  /**
   * Super Admin Remove Subscription
   * @param {string} id
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async removeSubscription(id) {
    const response = await httpClient.post(`/salons/${id}/subscription/remove`);
    return response.data;
  },
};

export default salonsApi;
