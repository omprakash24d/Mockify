/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Firestore timestamp or Date object
 * @returns Formatted date string
 */
export const formatDate = (timestamp: unknown): string => {
  if (!timestamp) return "Unknown";

  const ts = timestamp as { seconds?: number } | Date;
  const date = (ts as { seconds?: number }).seconds
    ? new Date((ts as { seconds: number }).seconds * 1000)
    : new Date(ts as Date);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Gets the default recent activity list for the dashboard
 * @param stats - Dashboard statistics object
 * @returns Array of activity strings
 */
export const getDefaultRecentActivity = (stats: {
  totalSubjects: number;
  totalChapters: number;
  totalQuestions: number;
}): string[] => [
  `${stats.totalSubjects} subjects available for study`,
  `${stats.totalChapters} chapters organized by topics`,
  `${stats.totalQuestions} practice questions ready`,
  "Smart PDF generation with answer keys",
  "Progress tracking and analytics",
  "Multi-device responsive design",
];

/**
 * Gets the default study tips for the sidebar
 * @returns Array of study tip strings
 */
export const getStudyTips = (): string[] => [
  "Practice regularly for better retention",
  "Review wrong answers to learn faster",
  "Take breaks during long study sessions",
  "Focus on weak areas for improvement",
];
