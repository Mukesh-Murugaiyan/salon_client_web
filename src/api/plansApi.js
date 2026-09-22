import httpClient from '../services/httpClient';

/**
 * Plans Management API Client
 */
export const plansApi = {
  /**
   * Retrieves all subscription plans.
   * @param {Object} [params] - { isActive }
   * @returns {Promise<{ success: boolean, plans: Array }>}
   */
  async listPlans(params = {}) {
    const response = await httpClient.get('/plans', { params });
    return response.data;
  },

  /**
   * Retrieves single plan by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, plan: Object }>}
   */
  async getPlan(id) {
    const response = await httpClient.get(`/plans/${id}`);
    return response.data;
  },

  /**
   * Creates a new subscription plan tier.
   * @param {Object} data - { name, description, price, durationInDays, maxStaff, maxAppointments, isActive }
   * @returns {Promise<{ success: boolean, plan: Object, message: string }>}
   */
  async createPlan(data) {
    const response = await httpClient.post('/plans', data);
    return response.data;
  },

  /**
   * Updates an existing plan.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<{ success: boolean, plan: Object, message: string }>}
   */
  async updatePlan(id, data) {
    const response = await httpClient.put(`/plans/${id}`, data);
    return response.data;
  },

  /**
   * Deactivates a plan.
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, plan: Object }>}
   */
  async deletePlan(id) {
    const response = await httpClient.delete(`/plans/${id}`);
    return response.data;
  },
};
