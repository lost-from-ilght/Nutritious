/**
 * Date utility functions
 */

/**
 * Get today's date at midnight (UTC)
 */
export const getToday = (): Date => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

/**
 * Get date string in YYYY-MM-DD format
 */
export const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
};

/**
 * Get date N days ago
 */
export const getDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/**
 * Get start of day for a given date
 */
export const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

/**
 * Get end of day for a given date
 */
export const getEndOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};

