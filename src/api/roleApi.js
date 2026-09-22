import httpClient from '../services/httpClient';

/**
 * Role & Permission Management API Client
 */
export const roleApi = {
  /**
   * Retrieves all roles with user counts for the company.
   * @returns {Promise<{ success: boolean, roles: Array }>}
   */
  async listRoles() {
    const response = await httpClient.get('/roles');
    return response.data;
  },

  /**
   * Retrieves a single role along with assigned users and permission catalog.
   * @param {string} id
   * @returns {Promise<{ success: boolean, role: Object, users: Array, catalog: Array }>}
   */
  async getRole(id) {
    const response = await httpClient.get(`/roles/${id}`);
    return response.data;
  },

  /**
   * Creates a new role for the company.
   * @param {Object} data - { name, code, description, isActive, permissions }
   * @returns {Promise<{ success: boolean, role: Object }>}
   */
  async createRole(data) {
    const response = await httpClient.post('/roles', data);
    return response.data;
  },

  /**
   * Updates role metadata.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<{ success: boolean, role: Object }>}
   */
  async updateRole(id, data) {
    const response = await httpClient.put(`/roles/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a role (allowed only if no users assigned).
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteRole(id) {
    const response = await httpClient.delete(`/roles/${id}`);
    return response.data;
  },

  /**
   * Retrieves role permissions and system catalog for permission matrix.
   * @param {string} id
   * @returns {Promise<{ success: boolean, roleId: string, roleName: string, permissions: Array, catalog: Array }>}
   */
  async getRolePermissions(id) {
    const response = await httpClient.get(`/roles/${id}/permissions`);
    return response.data;
  },

  /**
   * Updates permission assignments for a role.
   * @param {string} id
   * @param {Array<string>} permissions
   * @returns {Promise<{ success: boolean, permissions: Array, message: string }>}
   */
  async updateRolePermissions(id, permissions) {
    const response = await httpClient.put(`/roles/${id}/permissions`, { permissions });
    return response.data;
  },
};

export default roleApi;
