import httpClient from '../services/httpClient';

/**
 * Appointments Management API Client
 */
export const appointmentsApi = {
  /**
   * Retrieves appointments scoped to the authenticated company.
   * @param {Object} [params] - { date, staffId, clientId, status, search }
   * @returns {Promise<{ success: boolean, appointments: Array }>}
   */
  async listAppointments(params = {}) {
    const response = await httpClient.get('/appointments', { params });
    return response.data;
  },

  /**
   * Retrieves single appointment by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, appointment: Object }>}
   */
  async getAppointment(id) {
    const response = await httpClient.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Schedules a new appointment.
   * @param {Object} data - { clientId, staffId, serviceId, date, startTime, endTime, notes, status }
   * @returns {Promise<{ success: boolean, appointment: Object, message: string }>}
   */
  async createAppointment(data) {
    const response = await httpClient.post('/appointments', data);
    return response.data;
  },

  /**
   * Updates an existing appointment.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<{ success: boolean, appointment: Object, message: string }>}
   */
  async updateAppointment(id, data) {
    const response = await httpClient.put(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Cancels / deletes an appointment (sets status = 'CANCELLED').
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, status: string }>}
   */
  async deleteAppointment(id) {
    const response = await httpClient.delete(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Updates appointment status (PENDING, CONFIRMED, COMPLETED, CANCELLED).
   * @param {string} id
   * @param {string} status
   * @returns {Promise<{ success: boolean, appointment: Object, message: string }>}
   */
  async updateStatus(id, status) {
    const response = await httpClient.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Returns DB-level active counts for clients, staff, and services.
   * Use this to determine if booking is possible (canBook) without
   * fetching full resource lists.
   * Requires: appointments:create permission.
   * @returns {Promise<{ success: boolean, clientsCount: number, staffCount: number, servicesCount: number, canBook: boolean }>}
   */
  async getReadiness() {
    const response = await httpClient.get('/appointments/readiness');
    return response.data;
  },

  /**
   * Returns minimal id+name lists for clients, staff, and services —
   * only what is needed to populate booking form dropdowns.
   * Requires: appointments:create permission.
   * @returns {Promise<{ success: boolean, clients: Array, staff: Array, services: Array }>}
   */
  async getFormData() {
    const response = await httpClient.get('/appointments/form-data');
    return response.data;
  },
};
