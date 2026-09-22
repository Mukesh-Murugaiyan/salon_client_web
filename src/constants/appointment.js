/**
 * Appointment Constants & UI Configurations
 */

export const APPOINTMENT_STATUS = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const STATUS_CONFIG = {
  [APPOINTMENT_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    color: 'primary',
    bg: '#eff6ff',
    textColor: '#1d4ed8',
  },
  [APPOINTMENT_STATUS.PENDING]: {
    label: 'Pending',
    color: 'warning',
    bg: '#fffbeb',
    textColor: '#b45309',
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'success',
    bg: '#f0fdf4',
    textColor: '#15803d',
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'error',
    bg: '#fef2f2',
    textColor: '#b91c1c',
  },
};

export const BUSINESS_HOURS = {
  START: '09:00',
  END: '20:00',
  START_MINUTES: 9 * 60,
  END_MINUTES: 20 * 60,
};

/**
 * Converts HH:mm time string to minutes from midnight.
 * @param {string} timeStr
 * @returns {number}
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return NaN;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return NaN;
  return hours * 60 + minutes;
};

/**
 * Converts minutes from midnight to HH:mm string.
 * @param {number} totalMinutes
 * @returns {string}
 */
export const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Calculates end time based on start time and duration in minutes.
 * @param {string} startTime - "09:30"
 * @param {number} durationInMinutes - 45
 * @returns {string} - "10:15"
 */
export const calculateEndTime = (startTime, durationInMinutes) => {
  const startMins = timeToMinutes(startTime);
  if (isNaN(startMins) || !durationInMinutes) return '';
  return minutesToTime(startMins + Number(durationInMinutes));
};
