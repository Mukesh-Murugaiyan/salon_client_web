/**
 * String Utility Class
 * Centralizes string operations, title casing, initials, and sanitization for web client.
 */
export class StringUtils {
  /**
   * Capitalizes the first character of a string.
   * @param {string} [str]
   * @returns {string}
   */
  static capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Converts a string into Title Case.
   * @param {string} [str]
   * @returns {string}
   */
  static toTitleCase(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Trims whitespace safely, returning empty string for null/undefined.
   * @param {string} [str]
   * @returns {string}
   */
  static trim(str) {
    return (str || '').trim();
  }

  /**
   * Truncates a string to a maximum length with an ellipsis.
   * @param {string} [str]
   * @param {number} [maxLength=30]
   * @param {string} [suffix='...']
   * @returns {string}
   */
  static truncate(str, maxLength = 30, suffix = '...') {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trimEnd() + suffix;
  }

  /**
   * Extracts initials from a name (e.g. "Jane Doe" -> "JD").
   * @param {string} [name]
   * @returns {string}
   */
  static getInitials(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Masks sensitive text like phone numbers or emails.
   * @param {string} [str]
   * @param {number} [visibleEndCount=4]
   * @returns {string}
   */
  static maskSensitive(str, visibleEndCount = 4) {
    if (!str) return '';
    if (str.length <= visibleEndCount) return str;
    const maskedPart = '*'.repeat(str.length - visibleEndCount);
    const visiblePart = str.slice(-visibleEndCount);
    return maskedPart + visiblePart;
  }

  /**
   * Strips control characters.
   * @param {string} [str]
   * @returns {string}
   */
  static sanitize(str) {
    if (!str) return '';
    return str.replace(/[\x00-\x1F\x7F]/g, '').trim();
  }
}
