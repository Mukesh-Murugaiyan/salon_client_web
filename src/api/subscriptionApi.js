import httpClient from '../services/httpClient';

/**
 * Subscription Management API Client
 */
export const subscriptionApi = {
  /**
   * Retrieves active company subscription, plan details, and quota usage.
   * @returns {Promise<{ success: boolean, subscription: Object }>}
   */
  async getCurrentSubscription() {
    const response = await httpClient.get('/subscription');
    return response.data;
  },

  /**
   * Assigns a plan to the company.
   * @param {string} planId
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async assignPlan(planId) {
    const response = await httpClient.post('/subscription/assign', { planId });
    return response.data;
  },

  /**
   * Renews current subscription.
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async renewSubscription() {
    const response = await httpClient.post('/subscription/renew');
    return response.data;
  },

  /**
   * Upgrades company to a new plan tier.
   * @param {string} planId
   * @returns {Promise<{ success: boolean, subscription: Object, message: string }>}
   */
  async upgradePlan(planId) {
    const response = await httpClient.post('/subscription/upgrade', { planId });
    return response.data;
  },

  /**
   * Retrieves subscription history audit trail.
   * @returns {Promise<{ success: boolean, history: Array }>}
   */
  async getSubscriptionHistory() {
    const response = await httpClient.get('/subscription/history');
    return response.data;
  },
};
