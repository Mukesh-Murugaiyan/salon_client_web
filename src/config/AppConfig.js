/**
 * AppConfig Class
 * Centralizes application-level configuration, constants, and defaults for the web client.
 */
export class AppConfig {
  static APP_NAME = 'Salon CRM';
  static APP_SUBTITLE = 'Management & Administration Portal';
  static APP_VERSION = '1.0.0';

  /**
   * Operating Hours Defaults
   */
  static OPERATING_HOURS = {
    DEFAULT_OPENING_TIME: '09:00',
    DEFAULT_CLOSING_TIME: '20:00',
  };

  /**
   * Pagination Defaults
   */
  static PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
  };

  /**
   * Local Storage Keys
   */
  static STORAGE_KEYS = {
    AUTH_TOKEN: 'salon_crm_token',
    AUTH_USER: 'salon_crm_user',
    THEME_MODE: 'salon_theme_mode',
  };

  /**
   * System Roles
   */
  static ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    OWNER: 'OWNER',
    RECEPTIONIST: 'RECEPTIONIST',
    STAFF: 'STAFF',
  };
}
