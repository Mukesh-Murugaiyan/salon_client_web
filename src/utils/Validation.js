/**
 * Validation Utility Class
 * Centralizes input and format validations for the web client.
 */
export class Validation {
  static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/;

  /**
   * Checks if string is a valid email address format.
   * @param {string} [email]
   * @returns {boolean}
   */
  static isValidEmail(email) {
    if (!email) return false;
    return this.EMAIL_REGEX.test(String(email).trim());
  }

  /**
   * Validates password presence and optional minimum length.
   * @param {string} [password]
   * @param {number} [minLength=6]
   * @returns {boolean}
   */
  static isValidPassword(password, minLength = 6) {
    if (!password) return false;
    return String(password).length >= minLength;
  }

  /**
   * Validates login inputs and returns a structured validation outcome.
   * @param {string} [email]
   * @param {string} [password]
   * @returns {{ isValid: boolean, error?: string }}
   */
  static validateLoginCredentials(email, password) {
    if (!email || !String(email).trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    if (!this.isValidEmail(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }
    return { isValid: true };
  }

  /**
   * Validates telephone numbers.
   * @param {string} [phone]
   * @returns {boolean}
   */
  static isValidPhone(phone) {
    if (!phone) return false;
    return this.PHONE_REGEX.test(String(phone).trim());
  }

  /**
   * Validates whether a value has non-whitespace characters.
   * @param {string} [value]
   * @returns {boolean}
   */
  static isNonEmpty(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Validates whether a string is a well-formed HTTP/HTTPS URL.
   * @param {string} [url]
   * @returns {boolean}
   */
  static isValidUrl(url) {
    if (!url) return false;
    try {
      const parsed = new URL(String(url).trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validates geographic coordinates.
   * @param {number} lat
   * @param {number} lng
   * @returns {boolean}
   */
  static isValidCoordinates(lat, lng) {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      return false;
    }
    const nLat = Number(lat);
    const nLng = Number(lng);
    if (isNaN(nLat) || isNaN(nLng)) return false;
    return nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180;
  }
}
