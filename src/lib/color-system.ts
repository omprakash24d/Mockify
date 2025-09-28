// Color System - Industry-grade centralized color management
// This file controls all colors throughout the application
// Change colors here and they will be reflected everywhere

// Brand Colors - Customize these to change the entire app's color scheme
export const brandColors = {
  // Primary Brand Colors
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Main primary color
    600: "#2563eb", // Primary hover
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },

  // Secondary Colors
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b", // Main secondary color
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },

  // Accent Colors
  accent: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // Main accent color
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49",
  },
};

// Semantic Colors - Used for status and feedback
export const semanticColors = {
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // Main success color
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // Main warning color
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03",
  },

  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // Main error color
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a",
  },

  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Main info color
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
};

// Neutral Colors - Used for backgrounds, text, borders
export const neutralColors = {
  white: "#ffffff",
  black: "#000000",

  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
};

// Theme-specific color mappings
export const getThemeColors = (theme: "light" | "dark") => ({
  // Background Colors
  background: {
    primary: theme === "light" ? neutralColors.white : neutralColors.gray[900],
    secondary:
      theme === "light" ? neutralColors.gray[50] : neutralColors.gray[800],
    tertiary:
      theme === "light" ? neutralColors.gray[100] : neutralColors.gray[700],
    elevated: theme === "light" ? neutralColors.white : neutralColors.gray[800],
    overlay: theme === "light" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.7)",
  },

  // Text Colors
  text: {
    primary: theme === "light" ? neutralColors.gray[900] : neutralColors.white,
    secondary:
      theme === "light" ? neutralColors.gray[600] : neutralColors.gray[400],
    tertiary:
      theme === "light" ? neutralColors.gray[500] : neutralColors.gray[500],
    inverse: theme === "light" ? neutralColors.white : neutralColors.gray[900],
    accent:
      theme === "light" ? brandColors.primary[600] : brandColors.primary[400],
    success:
      theme === "light"
        ? semanticColors.success[600]
        : semanticColors.success[400],
    warning:
      theme === "light"
        ? semanticColors.warning[600]
        : semanticColors.warning[400],
    error:
      theme === "light" ? semanticColors.error[600] : semanticColors.error[400],
    info:
      theme === "light" ? semanticColors.info[600] : semanticColors.info[400],
  },

  // Border Colors
  border: {
    default:
      theme === "light" ? neutralColors.gray[200] : neutralColors.gray[700],
    muted:
      theme === "light" ? neutralColors.gray[100] : neutralColors.gray[800],
    strong:
      theme === "light" ? neutralColors.gray[300] : neutralColors.gray[600],
    brand:
      theme === "light" ? brandColors.primary[500] : brandColors.primary[400],
    success:
      theme === "light"
        ? semanticColors.success[300]
        : semanticColors.success[600],
    warning:
      theme === "light"
        ? semanticColors.warning[300]
        : semanticColors.warning[600],
    error:
      theme === "light" ? semanticColors.error[300] : semanticColors.error[600],
  },

  // Interactive Colors
  interactive: {
    primary: {
      default:
        theme === "light" ? brandColors.primary[600] : brandColors.primary[500],
      hover:
        theme === "light" ? brandColors.primary[700] : brandColors.primary[600],
      active:
        theme === "light" ? brandColors.primary[800] : brandColors.primary[700],
      disabled:
        theme === "light" ? neutralColors.gray[300] : neutralColors.gray[600],
    },
    secondary: {
      default:
        theme === "light" ? neutralColors.gray[200] : neutralColors.gray[700],
      hover:
        theme === "light" ? neutralColors.gray[300] : neutralColors.gray[600],
      active:
        theme === "light" ? neutralColors.gray[400] : neutralColors.gray[500],
      disabled:
        theme === "light" ? neutralColors.gray[100] : neutralColors.gray[800],
    },
  },

  // Status Colors
  status: {
    success: {
      background:
        theme === "light"
          ? semanticColors.success[50]
          : "rgba(34, 197, 94, 0.1)",
      border:
        theme === "light"
          ? semanticColors.success[200]
          : semanticColors.success[800],
      text:
        theme === "light"
          ? semanticColors.success[800]
          : semanticColors.success[200],
    },
    warning: {
      background:
        theme === "light"
          ? semanticColors.warning[50]
          : "rgba(245, 158, 11, 0.1)",
      border:
        theme === "light"
          ? semanticColors.warning[200]
          : semanticColors.warning[800],
      text:
        theme === "light"
          ? semanticColors.warning[800]
          : semanticColors.warning[200],
    },
    error: {
      background:
        theme === "light" ? semanticColors.error[50] : "rgba(239, 68, 68, 0.1)",
      border:
        theme === "light"
          ? semanticColors.error[200]
          : semanticColors.error[800],
      text:
        theme === "light"
          ? semanticColors.error[800]
          : semanticColors.error[200],
    },
    info: {
      background:
        theme === "light" ? semanticColors.info[50] : "rgba(59, 130, 246, 0.1)",
      border:
        theme === "light" ? semanticColors.info[200] : semanticColors.info[800],
      text:
        theme === "light" ? semanticColors.info[800] : semanticColors.info[200],
    },
  },
});

// CSS Variable Generator - Creates CSS custom properties
export const generateCSSVariables = (theme: "light" | "dark") => {
  const colors = getThemeColors(theme);
  const variables: Record<string, string> = {};

  // Generate CSS variables for all color categories
  Object.entries(colors).forEach(([category, categoryColors]) => {
    Object.entries(categoryColors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === "string") {
        variables[`--color-${category}-${colorName}`] = colorValue;
      } else if (typeof colorValue === "object") {
        Object.entries(colorValue).forEach(([shade, shadeValue]) => {
          variables[`--color-${category}-${colorName}-${shade}`] =
            shadeValue as string;
        });
      }
    });
  });

  return variables;
};

// Tailwind Class Generator - Creates consistent Tailwind classes
export const createThemeClasses = (theme: "light" | "dark") => {
  const isDark = theme === "dark";

  return {
    // Background Classes
    bg: {
      primary: isDark ? "bg-black" : "bg-white",
      secondary: isDark ? "bg-neutral-900" : "bg-gray-50",
      tertiary: isDark ? "bg-neutral-800" : "bg-gray-100",
      elevated: isDark ? "bg-neutral-900" : "bg-white",
      overlay: isDark ? "bg-black/80" : "bg-black/50",
    },

    // Text Classes
    text: {
      primary: isDark ? "text-white" : "text-gray-900",
      secondary: isDark ? "text-neutral-400" : "text-gray-600",
      tertiary: isDark ? "text-neutral-500" : "text-gray-500",
      inverse: isDark ? "text-gray-900" : "text-white",
      accent: isDark ? "text-blue-400" : "text-blue-600",
      success: isDark ? "text-green-400" : "text-green-600",
      warning: isDark ? "text-yellow-400" : "text-yellow-600",
      error: isDark ? "text-red-400" : "text-red-600",
      info: isDark ? "text-blue-400" : "text-blue-600",
    },

    // Border Classes
    border: {
      default: isDark ? "border-neutral-700" : "border-gray-200",
      muted: isDark ? "border-neutral-800" : "border-gray-100",
      strong: isDark ? "border-neutral-600" : "border-gray-300",
      brand: isDark ? "border-blue-400" : "border-blue-500",
      success: isDark ? "border-green-600" : "border-green-300",
      warning: isDark ? "border-yellow-600" : "border-yellow-300",
      error: isDark ? "border-red-600" : "border-red-300",
    },

    // Button Classes
    button: {
      primary: isDark
        ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white",
      secondary: isDark
        ? "bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-white"
        : "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900",
      outline: isDark
        ? "border-neutral-600 hover:bg-neutral-800 text-neutral-300"
        : "border-gray-300 hover:bg-gray-50 text-gray-700",
      ghost: isDark
        ? "hover:bg-neutral-800 text-neutral-300"
        : "hover:bg-gray-100 text-gray-700",
      danger: isDark
        ? "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white"
        : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white",
    },

    // Input Classes - Professional styling like top companies
    input: {
      default: isDark
        ? "bg-neutral-900 border-neutral-600 text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-blue-500/30 hover:border-neutral-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-400",
      error: isDark
        ? "bg-neutral-900 border-red-500 text-white placeholder-neutral-400 focus:border-red-400 focus:ring-red-400/30"
        : "bg-white border-red-400 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20",
    },

    // Card Classes
    card: isDark
      ? "bg-neutral-900 border-neutral-700"
      : "bg-white border-gray-200",

    // Navigation Classes
    nav: {
      active: isDark
        ? "bg-blue-500/20 text-blue-300"
        : "bg-blue-100 text-blue-700",
      inactive: isDark
        ? "text-neutral-300 hover:bg-neutral-800"
        : "text-gray-700 hover:bg-gray-100",
    },

    // Status Classes
    status: {
      success: isDark
        ? "bg-green-500/10 border-green-600 text-green-400"
        : "bg-green-50 border-green-200 text-green-800",
      warning: isDark
        ? "bg-yellow-500/10 border-yellow-600 text-yellow-400"
        : "bg-yellow-50 border-yellow-200 text-yellow-800",
      error: isDark
        ? "bg-red-500/10 border-red-600 text-red-400"
        : "bg-red-50 border-red-200 text-red-800",
      info: isDark
        ? "bg-blue-900/20 border-blue-800 text-blue-200"
        : "bg-blue-50 border-blue-200 text-blue-800",
    },
  };
};

// Utility function to get theme-aware classes
export const getThemeClass = (
  category: keyof ReturnType<typeof createThemeClasses>,
  variant: string,
  theme: "light" | "dark"
): string => {
  const themeClasses = createThemeClasses(theme);
  const categoryClasses = themeClasses[category];

  if (typeof categoryClasses === "string") {
    return categoryClasses;
  }

  return (categoryClasses as any)[variant] || "";
};

// Hook for using theme colors in components
export const useThemeColors = (theme: "light" | "dark") => {
  return {
    colors: getThemeColors(theme),
    classes: createThemeClasses(theme),
    getClass: (category: string, variant: string) =>
      getThemeClass(category as any, variant, theme),
  };
};
