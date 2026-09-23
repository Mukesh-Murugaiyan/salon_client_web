/**
 * Number Utility Class
 * Centralizes numeric formatting, currency representation, and parsing for web client.
 */
export class NumberUtils {
  /**
   * Formats a monetary amount into a localized currency string.
   * Defaults to ₹ or customizable.
   * @param {number|string} [amount]
   * @param {string} [symbol='₹']
   * @param {number} [fractionDigits=2]
   * @returns {string}
   */
  static formatCurrency(amount, symbol = '₹', fractionDigits = 2) {
    if (amount === undefined || amount === null || amount === '') return `${symbol}0.00`;
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return `${symbol}0.00`;

    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });

    return `${symbol}${formatted}`;
  }

  /**
   * Formats a numeric value with standard thousands separators.
   * @param {number|string} [value]
   * @returns {string}
   */
  static formatNumber(value) {
    if (value === undefined || value === null || value === '') return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  }

  /**
   * Restricts a number to be within specified bounds [min, max].
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Rounds a number to a specified number of decimal places.
   * @param {number} value
   * @param {number} [decimals=2]
   * @returns {number}
   */
  static round(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Safely parses any value to a number, returning fallback if invalid.
   * @param {unknown} value
   * @param {number} [fallback=0]
   * @returns {number}
   */
  static parseNumber(value, fallback = 0) {
    if (typeof value === 'number') return isNaN(value) ? fallback : value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  /**
   * Calculates a percentage between 0 and 100.
   * @param {number} value
   * @param {number} total
   * @param {number} [decimals=0]
   * @returns {number}
   */
  static toPercentage(value, total, decimals = 0) {
    if (!total || total <= 0) return 0;
    const pct = (value / total) * 100;
    return this.round(pct, decimals);
  }
}
