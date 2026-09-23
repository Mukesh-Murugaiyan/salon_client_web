import httpClient from '../services/httpClient';

/**
 * Attendance Management API Client
 */
export const attendanceApi = {
  /**
   * Retrieves attendance records scoped to the authenticated salon tenant.
   * @param {Object} [params] - { date, userId, status, search, page, limit }
   * @returns {Promise<{ success: boolean, attendance: Array, total: number, page: number, totalPages: number }>}
   */
  async listAttendance(params = {}) {
    const response = await httpClient.get('/attendance', { params });
    return response.data;
  },

  /**
   * Retrieves single attendance record by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, attendance: Object }>}
   */
  async getAttendance(id) {
    const response = await httpClient.get(`/attendance/${id}`);
    return response.data;
  },

  /**
   * Retrieves today's attendance status for authenticated user.
   * @returns {Promise<{ success: boolean, attendance: Object|null, hasCheckedIn: boolean, hasCheckedOut: boolean, salonLocation: Object|null }>}
   */
  async getTodayStatus() {
    const response = await httpClient.get('/attendance/today');
    return response.data;
  },

  /**
   * Submits check-in with GPS coordinates.
   * @param {Object} data - { latitude, longitude }
   * @returns {Promise<{ success: boolean, message: string, attendance: Object }>}
   */
  async checkIn(data) {
    const response = await httpClient.post('/attendance/check-in', data);
    return response.data;
  },

  /**
   * Submits check-out for today's attendance.
   * @returns {Promise<{ success: boolean, message: string, attendance: Object }>}
   */
  async checkOut() {
    const response = await httpClient.post('/attendance/check-out', {});
    return response.data;
  },

  /**
   * Deletes an attendance record strictly scoped to the tenant.
   * Resets the attendance state and allows the employee to check in again.
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, attendance: Object }>}
   */
  async deleteAttendance(id) {
    const response = await httpClient.delete(`/attendance/${id}`);
    return response.data;
  },

  /**
   * Retrieves salon geo-fence coordinates and radius.
   * @returns {Promise<{ success: boolean, location: Object }>}
   */
  async getLocation() {
    const response = await httpClient.get('/attendance/location');
    return response.data;
  },
};

export default attendanceApi;
