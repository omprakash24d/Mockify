/**
 * Theme utilities for consistent dark/light mode styling across the application
 */

export const themeClasses = {
  // Background colors
  background: {
    primary: "bg-white dark:bg-gray-900",
    secondary: "bg-gray-50 dark:bg-gray-800",
    tertiary: "bg-gray-100 dark:bg-gray-700",
    card: "bg-white dark:bg-gray-800",
    overlay: "bg-white/95 dark:bg-gray-900/95",
    hover: "hover:bg-gray-50 dark:hover:bg-gray-800",
    active: "bg-gray-100 dark:bg-gray-700",
  },

  // Text colors
  text: {
    primary: "text-gray-900 dark:text-gray-100",
    secondary: "text-gray-600 dark:text-gray-400",
    tertiary: "text-gray-500 dark:text-gray-500",
    muted: "text-gray-400 dark:text-gray-600",
    inverse: "text-white dark:text-gray-900",
    accent: "text-blue-600 dark:text-blue-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-600 dark:text-red-400",
  },

  // Border colors
  border: {
    primary: "border-gray-200 dark:border-gray-700",
    secondary: "border-gray-300 dark:border-gray-600",
    accent: "border-blue-200 dark:border-blue-700",
    success: "border-green-200 dark:border-green-700",
    warning: "border-yellow-200 dark:border-yellow-700",
    error: "border-red-200 dark:border-red-700",
  },

  // Interactive elements
  interactive: {
    hover: "hover:bg-gray-100 dark:hover:bg-gray-700",
    active: "active:bg-gray-200 dark:active:bg-gray-600",
    focus: "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
    disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
  },

  // Form elements
  form: {
    input:
      "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
    select:
      "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
    button: {
      primary:
        "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
      secondary:
        "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100",
      outline:
        "border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
      ghost:
        "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400",
    },
  },

  // Status colors
  status: {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-200",
      border: "border-green-200 dark:border-green-800",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-800 dark:text-yellow-200",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-200",
      border: "border-red-200 dark:border-red-800",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-200",
      border: "border-blue-200 dark:border-blue-800",
    },
  },

  // Layout components
  layout: {
    header:
      "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
    sidebar:
      "bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
    footer: "bg-gray-900 dark:bg-gray-950 text-white",
    modal:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    dropdown:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg",
  },
} as const;

/**
 * Helper function to combine theme classes with custom classes
 */
export const combineThemeClasses = (
  themeClass: string,
  customClass?: string
): string => {
  return customClass ? `${themeClass} ${customClass}` : themeClass;
};

/**
 * Get theme-aware classes for difficulty levels (NEET specific)
 */
export const getDifficultyThemeClasses = (difficulty: string) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

  switch (difficulty.toLowerCase()) {
    case "level 1":
    case "easy":
      return `${baseClasses} ${themeClasses.status.success.bg} ${themeClasses.status.success.text}`;
    case "level 2":
    case "medium":
      return `${baseClasses} ${themeClasses.status.info.bg} ${themeClasses.status.info.text}`;
    case "level 3":
    case "hard":
      return `${baseClasses} ${themeClasses.status.warning.bg} ${themeClasses.status.warning.text}`;
    case "level 4":
    case "expert":
      return `${baseClasses} ${themeClasses.status.error.bg} ${themeClasses.status.error.text}`;
    default:
      return `${baseClasses} bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400`;
  }
};

/**
 * Get subject-specific theme colors
 */
export const getSubjectThemeClasses = (subject: string) => {
  const colorMap: Record<string, { bg: string; icon: string; border: string }> =
    {
      Physics: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        icon: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-700",
      },
      Chemistry: {
        bg: "bg-green-100 dark:bg-green-900/30",
        icon: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-700",
      },
      Biology: {
        bg: "bg-red-100 dark:bg-red-900/30",
        icon: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-700",
      },
      Mathematics: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        icon: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-700",
      },
    };

  return (
    colorMap[subject] || {
      bg: "bg-gray-100 dark:bg-gray-800",
      icon: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-700",
    }
  );
};
