/**
 * Format a date string to a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format time spent in minutes to hours and minutes
 * @param minutes Time in minutes
 * @returns Formatted time string (e.g., "2h 30m")
 */
export const formatTimeSpent = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
};

/**
 * Get date range for the current week
 * @returns Object with start and end dates
 */
export const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Calculate start date (Sunday)
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - dayOfWeek);
  
  // Calculate end date (Saturday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

/**
 * Get date range for the current month
 * @returns Object with start and end dates
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  
  // First day of current month
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Last day of current month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

/**
 * Format a date for display in a calendar
 * @param dateString ISO date string
 * @returns Day and month (e.g., "15 Jan")
 */
export const formatCalendarDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
};

/**
 * Get an array of dates for the last N days
 * @param days Number of days to include
 * @returns Array of date strings in ISO format
 */
export const getLastNDays = (days: number): string[] => {
  const result = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    result.push(date.toISOString().split('T')[0]);
  }
  
  return result.reverse(); // Return in chronological order
};

/**
 * Check if a date is today
 * @param dateString ISO date string
 * @returns Boolean indicating if the date is today
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};