import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for optimal class name handling
 * @param inputs - Class values to combine
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Enhanced theme classes for consistent styling across the application
 * Optimized for smooth theme transitions and accessibility
 */
export const themeClasses = {
  // Background classes with smooth transitions
  bg: {
    primary: "bg-white dark:bg-gray-900 transition-colors duration-300",
    secondary: "bg-gray-50 dark:bg-gray-800 transition-colors duration-300",
    elevated: "bg-white dark:bg-gray-800 transition-colors duration-300",
    accent: "bg-gray-100 dark:bg-gray-700 transition-colors duration-300",
    card: "bg-white dark:bg-gray-800 transition-colors duration-300",
    overlay: "bg-black/50 dark:bg-black/70 transition-colors duration-300",
    glass:
      "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-all duration-300",
  },

  // Text classes with improved contrast
  text: {
    primary: "text-gray-900 dark:text-gray-100 transition-colors duration-300",
    secondary:
      "text-gray-600 dark:text-gray-400 transition-colors duration-300",
    muted: "text-gray-500 dark:text-gray-500 transition-colors duration-300",
    accent: "text-blue-600 dark:text-blue-400 transition-colors duration-300",
    success:
      "text-green-600 dark:text-green-400 transition-colors duration-300",
    warning:
      "text-yellow-600 dark:text-yellow-400 transition-colors duration-300",
    error: "text-red-600 dark:text-red-400 transition-colors duration-300",
    inverse: "text-white dark:text-gray-900 transition-colors duration-300",
  },

  // Border classes with consistent theming
  border: {
    default:
      "border-gray-200 dark:border-gray-700 transition-colors duration-300",
    light:
      "border-gray-100 dark:border-gray-800 transition-colors duration-300",
    focus:
      "border-blue-500 dark:border-blue-400 transition-colors duration-300",
    error: "border-red-300 dark:border-red-600 transition-colors duration-300",
    success:
      "border-green-300 dark:border-green-600 transition-colors duration-300",
  },

  // Enhanced button classes with better accessibility
  button: {
    primary:
      "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border border-transparent focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200",
    secondary:
      "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200",
    outline:
      "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200",
    danger:
      "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white border border-transparent focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200",
  },

  // Enhanced input classes
  input: {
    default:
      "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200",
    error:
      "bg-white dark:bg-gray-700 border-red-300 dark:border-red-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200",
  },

  // Enhanced status classes
  status: {
    success:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 transition-all duration-300",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 transition-all duration-300",
    error:
      "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 transition-all duration-300",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 transition-all duration-300",
  },

  // Navigation classes
  nav: {
    active:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 transition-all duration-200",
    inactive:
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200",
  },
};

/**
 * Helper function to retrieve specific theme classes by variant and type
 * @param variant - The theme variant category (bg, text, etc.)
 * @param type - The specific type within the variant
 * @returns The corresponding theme classes or default fallback
 */
export const getThemeClasses = (
  variant: keyof typeof themeClasses,
  type: string
): string => {
  const classes =
    themeClasses[variant]?.[
      type as keyof (typeof themeClasses)[typeof variant]
    ];

  // Fallback to default primary classes if not found
  if (!classes) {
    console.warn(
      `Theme classes not found for variant: ${variant}, type: ${type}`
    );
    return variant === "bg"
      ? themeClasses.bg.primary
      : variant === "text"
      ? themeClasses.text.primary
      : variant === "border"
      ? themeClasses.border.default
      : "";
  }

  return classes as string;
};

/**
 * Utility for theme-aware focus management with error state support
 * @param error - Whether to apply error focus styles
 * @returns Combined focus classes with proper theming
 */
export const getFocusClasses = (error?: boolean): string => {
  return cn(
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900",
    error
      ? "focus:ring-red-500 dark:focus:ring-red-400"
      : "focus:ring-blue-500 dark:focus:ring-blue-400"
  );
};

/**
 * Animation classes that respect user preferences and interaction states
 * @param animation - Type of animation to apply
 * @param duration - Animation duration in milliseconds
 * @param easing - CSS easing function
 * @returns Combined animation classes
 */
export const getAnimationClasses = (
  animation: "fade" | "slide" | "scale" | "none" = "fade",
  duration: number = 200,
  easing: "ease-in-out" | "ease-in" | "ease-out" | "linear" = "ease-in-out"
): string => {
  if (animation === "none") return "";

  const baseClasses = `transition-all duration-${duration} ${easing}`;

  switch (animation) {
    case "fade":
      return cn(baseClasses, "opacity-0 data-[state=open]:opacity-100");
    case "slide":
      return cn(
        baseClasses,
        "transform translate-y-2 data-[state=open]:translate-y-0"
      );
    case "scale":
      return cn(baseClasses, "transform scale-95 data-[state=open]:scale-100");
    default:
      return baseClasses;
  }
};

/**
 * Responsive utility classes for different screen sizes
 */
export const responsiveClasses = {
  container: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  grid: {
    responsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    cards: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    stats: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  },
  text: {
    responsive: "text-sm sm:text-base lg:text-lg",
    heading: "text-2xl sm:text-3xl lg:text-4xl font-bold",
    subheading: "text-lg sm:text-xl lg:text-2xl font-semibold",
  },
};

/**
 * Accessibility-focused utility classes
 */
export const a11yClasses = {
  screenReader: "sr-only",
  focusVisible:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
  skipLink:
    "absolute left-[-10000px] top-auto width-1 height-1 overflow-hidden focus:left-6 focus:top-7 focus:width-auto focus:height-auto focus:overflow-visible",
  highContrast:
    "contrast-more:border-black contrast-more:text-black dark:contrast-more:border-white dark:contrast-more:text-white",
};

/**
 * Loading and state utility classes
 */
export const stateClasses = {
  loading: "animate-pulse bg-gray-200 dark:bg-gray-700",
  disabled: "opacity-50 cursor-not-allowed pointer-events-none",
  interactive:
    "cursor-pointer hover:opacity-80 active:opacity-60 transition-opacity",
  skeleton:
    "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
};
