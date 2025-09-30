/**
 * Security Event Severity Badge Component
 */

import React from "react";

interface SeverityBadgeProps {
  severity: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";

  switch (severity) {
    case "critical":
      return (
        <span
          className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}
        >
          Critical
        </span>
      );
    case "high":
      return (
        <span
          className={`${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`}
        >
          High
        </span>
      );
    case "medium":
      return (
        <span
          className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}
        >
          Medium
        </span>
      );
    case "low":
      return (
        <span
          className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}
        >
          Low
        </span>
      );
    default:
      return (
        <span
          className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}
        >
          Unknown
        </span>
      );
  }
};

export default SeverityBadge;
