import httpClient from './httpClient';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Dashboard API Service
 * Fetches real metrics from backend endpoints using centralized httpClient.
 */

/**
 * Retrieves salon-scoped dashboard metrics (OWNER, RECEPTIONIST).
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const getDashboardSummary = async () => {
  const response = await httpClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY.value);
  return response.data;
};

/**
 * Retrieves platform-wide metrics (SUPER_ADMIN).
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const getAdminDashboardSummary = async () => {
  const response = await httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY.value);
  return response.data;
};

export default {
  getDashboardSummary,
  getAdminDashboardSummary,
};
