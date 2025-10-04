/**
 * Constants for the reporting system
 * Moved from component-level definitions for better reusability
 */

export const REPORT_TYPES = {
  wrong_answer: { label: "Wrong Answer", color: "text-red-600 bg-red-50" },
  multiple_correct: {
    label: "Multiple Correct",
    color: "text-purple-600 bg-purple-50",
  },
  unclear_question: {
    label: "Unclear Question",
    color: "text-orange-600 bg-orange-50",
  },
  typo: { label: "Typo/Grammar", color: "text-blue-600 bg-blue-50" },
  other: { label: "Other", color: "text-gray-600 bg-gray-50" },
} as const;

export const PRIORITY_COLORS = {
  critical: "text-red-700 bg-red-100",
  high: "text-orange-700 bg-orange-100",
  medium: "text-yellow-700 bg-yellow-100",
  low: "text-gray-700 bg-gray-100",
} as const;

export const STATUS_COLORS = {
  pending: "text-yellow-700 bg-yellow-100",
  reviewing: "text-blue-700 bg-blue-100",
  resolved: "text-green-700 bg-green-100",
  dismissed: "text-gray-700 bg-gray-100",
} as const;

export type ReportType = keyof typeof REPORT_TYPES;
export type ReportPriority = keyof typeof PRIORITY_COLORS;
export type ReportStatus = keyof typeof STATUS_COLORS;
