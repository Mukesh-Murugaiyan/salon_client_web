import httpClient from '../services/httpClient';

/**
 * Subscription Management API Client
 */
export const subscriptionApi = {
  /**
   * Retrieves active company subscription, plan details, and quota usage.
   * @param {string} [salonId] - Optional salonId override for Super Admin
   * @returns {Promise<{ success: boolean, subscription: Object }>}
   */
  async getCurrentSubscription(salonId) {
    const params = salonId ? { salonId } : {};
    const response = await httpClient.get('/subscription/status', { params });
    return response.data;
  },

  /**
   * Assigns a plan to the company.
   * @param {string} planId
   * @param {string} [salonId] - Optional salonId override for Super Admin
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async assignPlan(planId, salonId) {
    const payload = salonId ? { planId, salonId } : { planId };
    const response = await httpClient.post('/subscription/assign', payload);
    return response.data;
  },

  /**
   * Renews current subscription.
   * @param {string} [salonId] - Optional salonId override for Super Admin
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async renewSubscription(salonId) {
    const payload = salonId ? { salonId } : {};
    const response = await httpClient.post('/subscription/renew', payload);
    return response.data;
  },

  /**
   * Upgrades company to a new plan tier.
   * @param {string} planId
   * @param {string} [salonId] - Optional salonId override for Super Admin
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async upgradePlan(planId, salonId) {
    const payload = salonId ? { planId, salonId } : { planId };
    const response = await httpClient.post('/subscription/upgrade', payload);
    return response.data;
  },

  /**
   * Retrieves subscription history audit trail.
   * @param {string} [salonId] - Optional salonId override for Super Admin
   * @returns {Promise<{ success: boolean, history: Array }>}
   */
  async getSubscriptionHistory(salonId) {
    const params = salonId ? { salonId } : {};
    const response = await httpClient.get('/subscription/history', { params });
    return response.data;
  },

  /**
   * Completely removes the assigned plan.
   * @param {string} [salonId] - Optional salonId override for Super Admin
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async removePlan(salonId) {
    const payload = salonId ? { salonId } : {};
    const response = await httpClient.post('/subscription/remove', payload);
    return response.data;
  },
};
