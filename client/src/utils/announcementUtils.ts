// ================================================================
// ANNOUNCEMENT UTILITIES
// Helper functions for managing feature announcements
// ================================================================

export const ANNOUNCEMENT_KEYS = {
  HABIT_TRACKER: 'habit-tracker-announcement-seen',
  // Add more announcement keys here as you create new features
} as const;

/**
 * Check if a user has seen a specific announcement
 */
export const hasSeenAnnouncement = (key: string): boolean => {
  return localStorage.getItem(key) === 'true';
};

/**
 * Mark an announcement as seen
 */
export const markAnnouncementAsSeen = (key: string): void => {
  localStorage.setItem(key, 'true');
};

/**
 * Reset a specific announcement (for testing)
 */
export const resetAnnouncement = (key: string): void => {
  localStorage.removeItem(key);
};

/**
 * Reset all announcements (for testing)
 */
export const resetAllAnnouncements = (): void => {
  Object.values(ANNOUNCEMENT_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Get announcement status for debugging
 */
export const getAnnouncementStatus = (): Record<string, boolean> => {
  const status: Record<string, boolean> = {};
  Object.entries(ANNOUNCEMENT_KEYS).forEach(([name, key]) => {
    status[name] = hasSeenAnnouncement(key);
  });
  return status;
};
