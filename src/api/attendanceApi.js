import httpClient from '../services/httpClient';

/**
 * Attendance Management API Client
 */
export const attendanceApi = {
  /**
   * Submits employee check-in with GPS coordinates for server-side geo-fence verification.
   * @param {Object} data - { latitude, longitude }
   * @returns {Promise<{ success: boolean, message: string, attendance: Object }>}
   */
  async checkIn(data) {
    const response = await httpClient.post('/attendance/check-in', data);
    return response.data;
  },

  /**
   * Retrieves today's check-in status for the authenticated user.
   * @returns {Promise<{ success: boolean, attendance: Object|null, hasCheckedIn: boolean }>}
   */
  async getTodayAttendance() {
    const response = await httpClient.get('/attendance/today');
    return response.data;
  },

  /**
   * Retrieves attendance logs for the company with pagination and filters.
   * @param {Object} [params] - { date, userId, status, page, limit }
   * @returns {Promise<{ success: boolean, attendance: Array, total: number, page: number, totalPages: number }>}
   */
  async listAttendance(params = {}) {
    const response = await httpClient.get('/attendance', { params });
    return response.data;
  },

  /**
   * Retrieves a single attendance record by ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, attendance: Object }>}
   */
  async getAttendance(id) {
    const response = await httpClient.get(`/attendance/${id}`);
    return response.data;
  },

  /**
   * Retrieves configured salon geo-fence coordinates and radius.
   * @returns {Promise<{ success: boolean, location: Object }>}
   */
  async getLocationSettings() {
    const response = await httpClient.get('/attendance/location');
    return response.data;
  },

  /**
   * Updates salon geo-fence coordinates and radius.
   * @param {Object} data - { latitude, longitude, allowedRadiusInMeters }
   * @returns {Promise<{ success: boolean, message: string, location: Object }>}
   */
  async updateLocationSettings(data) {
    const response = await httpClient.put('/attendance/location', data);
    return response.data;
  },
};

export default attendanceApi;
