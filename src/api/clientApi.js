import httpClient from '../services/httpClient';

/**
 * Client Management API Client
 */
export const clientApi = {
  /**
   * Retrieves all clients scoped to the authenticated company.
   * @param {Object} [params] - { search, isActive }
   * @returns {Promise<{ success: boolean, clients: Array }>}
   */
  async listClients(params = {}) {
    const response = await httpClient.get('/clients', { params });
    return response.data;
  },

  /**
   * Retrieves single client profile by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, client: Object }>}
   */
  async getClient(id) {
    const response = await httpClient.get(`/clients/${id}`);
    return response.data;
  },

  /**
   * Provisions a new client.
   * @param {Object} data - { name, phone, email, gender, dateOfBirth, notes, isActive }
   * @returns {Promise<{ success: boolean, client: Object, message: string }>}
   */
  async createClient(data) {
    const response = await httpClient.post('/clients', data);
    return response.data;
  },

  /**
   * Updates an existing client record.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<{ success: boolean, client: Object, message: string }>}
   */
  async updateClient(id, data) {
    const response = await httpClient.put(`/clients/${id}`, data);
    return response.data;
  },

  /**
   * Soft deletes a client (sets isActive = false).
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, client: Object }>}
   */
  async deleteClient(id) {
    const response = await httpClient.delete(`/clients/${id}`);
    return response.data;
  },

  /**
   * Toggles client active/inactive status.
   * @param {string} id
   * @param {boolean} isActive
   * @returns {Promise<{ success: boolean, client: Object, message: string }>}
   */
  async toggleStatus(id, isActive) {
    const response = await httpClient.patch(`/clients/${id}/status`, { isActive });
    return response.data;
  },
};

export default clientApi;
