/**
 * Consolidated Theme Management System
 *
 * This file contains both theme context management and the ThemeToggle component
 * for a clean, modern, and maintainable theme system.
 *
 * Features:
 * - Theme context with localStorage persistence
 * - System preference detection
 * - Comprehensive theme classes for components
 * - Multiple toggle variants (button, switch, minimal, gradient, floating)
 * - Smooth transitions and animations
 * - Accessibility support
 */

import { Moon, Sun } from "lucide-react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { cn } from "../lib/utils";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  classes: {
    bg: {
      primary: string;
      secondary: string;
      elevated: string;
      accent: string;
      glass: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
      accent: string;
      tertiary: string;
      error: string;
      warning: string;
      success: string;
    };
    border: {
      default: string;
      light: string;
      error: string;
      warning: string;
      success: string;
    };
    button: {
      primary: string;
      secondary: string;
    };
    input: {
      default: string;
      error: string;
    };
    status: {
      error: string;
      success: string;
    };
  };
}

interface ThemeToggleProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "button" | "switch" | "minimal" | "gradient" | "floating";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    // Default to light theme during SSR
    if (typeof window === "undefined") {
      return "light";
    }

    // Try to get saved theme first
    try {
      const savedTheme = localStorage.getItem("mockify-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    } catch (error) {
      console.warn("Failed to read theme from localStorage:", error);
    }

    // Fall back to system preference if no saved theme
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (error) {
      console.warn("Failed to read system theme preference:", error);
      return "light";
    }
  });

  // Save theme to localStorage and manage HTML class
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apply theme class to HTML element
    const htmlElement = document.documentElement;
    if (theme === "dark") {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }

    // Save to localStorage
    try {
      localStorage.setItem("mockify-theme", theme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }

    // Dispatch custom event for other components that might listen
    window.dispatchEvent(
      new CustomEvent("theme-change", { detail: { theme } })
    );
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Add theme classes for easy access in components
  const classes = {
    bg: {
      primary: "bg-white dark:bg-gray-900 transition-colors duration-300",
      secondary: "bg-gray-50 dark:bg-gray-800 transition-colors duration-300",
      elevated: "bg-white dark:bg-gray-800 transition-colors duration-300",
      accent: "bg-gray-100 dark:bg-gray-700 transition-colors duration-300",
      glass:
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-all duration-300",
    },
    text: {
      primary:
        "text-gray-900 dark:text-gray-100 transition-colors duration-300",
      secondary:
        "text-gray-600 dark:text-gray-400 transition-colors duration-300",
      muted: "text-gray-500 dark:text-gray-500 transition-colors duration-300",
      accent: "text-blue-600 dark:text-blue-400 transition-colors duration-300",
      tertiary:
        "text-gray-400 dark:text-gray-600 transition-colors duration-300",
      error: "text-red-600 dark:text-red-400 transition-colors duration-300",
      warning:
        "text-yellow-600 dark:text-yellow-400 transition-colors duration-300",
      success:
        "text-green-600 dark:text-green-400 transition-colors duration-300",
    },
    border: {
      default:
        "border-gray-200 dark:border-gray-700 transition-colors duration-300",
      light:
        "border-gray-100 dark:border-gray-800 transition-colors duration-300",
      error:
        "border-red-200 dark:border-red-700 transition-colors duration-300",
      warning:
        "border-yellow-200 dark:border-yellow-700 transition-colors duration-300",
      success:
        "border-green-200 dark:border-green-700 transition-colors duration-300",
    },
    button: {
      primary:
        "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-all duration-200",
      secondary:
        "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-all duration-200",
    },
    input: {
      default:
        "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors duration-300",
      error:
        "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400",
    },
    status: {
      error:
        "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
      success:
        "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    },
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    classes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/* ============================================================================
 * THEME TOGGLE COMPONENT
 * ============================================================================
 * Modern, accessible theme toggle with multiple variants and smooth animations
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = "md",
  variant = "button",
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleToggle = () => {
    toggleTheme();
  };

  const sizeClasses = {
    xs: variant === "switch" ? "w-8 h-5" : "w-6 h-6 p-1",
    sm: variant === "switch" ? "w-10 h-6" : "w-8 h-8 p-1.5",
    md: variant === "switch" ? "w-12 h-7" : "w-10 h-10 p-2",
    lg: variant === "switch" ? "w-14 h-8" : "w-12 h-12 p-2.5",
    xl: variant === "switch" ? "w-16 h-9" : "w-14 h-14 p-3",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const switchThumbSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  };

  const switchTranslations = {
    xs: isDark ? "translate-x-3" : "translate-x-0",
    sm: isDark ? "translate-x-4" : "translate-x-0",
    md: isDark ? "translate-x-5" : "translate-x-0",
    lg: isDark ? "translate-x-6" : "translate-x-0",
    xl: isDark ? "translate-x-7" : "translate-x-0",
  };

  // Floating variant - modern floating button with backdrop blur
  if (variant === "floating") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          // Base styles with backdrop blur and glass effect
          "fixed bottom-6 right-6 z-50 rounded-full",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md",
          "border border-gray-200/50 dark:border-gray-700/50",
          "shadow-lg shadow-gray-500/10 dark:shadow-black/20",
          "hover:shadow-xl hover:shadow-gray-500/20 dark:hover:shadow-black/40",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-4 focus:ring-blue-500/20",
          "hover:scale-105 active:scale-95",

          // Size
          sizeClasses[size],

          className
        )}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <div className="relative flex items-center justify-center">
          <Sun
            className={cn(
              "absolute transition-all duration-500 ease-out",
              iconSizes[size],
              !isDark
                ? "opacity-100 scale-100 rotate-0 text-amber-500"
                : "opacity-0 scale-50 rotate-180 text-amber-400"
            )}
          />
          <Moon
            className={cn(
              "absolute transition-all duration-500 ease-out",
              iconSizes[size],
              isDark
                ? "opacity-100 scale-100 rotate-0 text-blue-400"
                : "opacity-0 scale-50 -rotate-180 text-blue-500"
            )}
          />
        </div>
      </button>
    );
  }

  // Gradient variant - modern gradient background
  if (variant === "gradient") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          // Base gradient styles
          "relative rounded-2xl transition-all duration-300",
          "bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500",
          "dark:from-blue-600 dark:via-purple-600 dark:to-indigo-600",
          "hover:from-amber-500 hover:via-orange-600 hover:to-pink-600",
          "dark:hover:from-blue-700 dark:hover:via-purple-700 dark:hover:to-indigo-700",
          "shadow-lg shadow-amber-500/25 dark:shadow-blue-500/25",
          "hover:shadow-xl hover:shadow-amber-500/40 dark:hover:shadow-blue-500/40",
          "focus:outline-none focus:ring-4 focus:ring-amber-500/30 dark:focus:ring-blue-500/30",
          "hover:scale-105 active:scale-95",

          // Size
          sizeClasses[size],

          className
        )}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <div className="relative flex items-center justify-center">
          <Sun
            className={cn(
              "absolute transition-all duration-500 ease-out text-white",
              iconSizes[size],
              !isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 rotate-180"
            )}
          />
          <Moon
            className={cn(
              "absolute transition-all duration-500 ease-out text-white",
              iconSizes[size],
              isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 -rotate-180"
            )}
          />
        </div>
      </button>
    );
  }

  // Minimal variant - clean text-based toggle
  if (variant === "minimal") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          // Minimal styles
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
          "text-sm font-medium transition-all duration-200",
          "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20",

          className
        )}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          <>
            <Moon className="w-4 h-4" />
            <span className="hidden sm:inline">Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4" />
            <span className="hidden sm:inline">Light</span>
          </>
        )}
      </button>
    );
  }

  // Switch variant - iOS-style toggle switch
  if (variant === "switch") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          // Base switch styles
          "relative rounded-full p-1 transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-4 focus:ring-blue-500/20",
          "hover:scale-105 active:scale-95",

          // Switch background colors
          isDark
            ? "bg-blue-600 hover:bg-blue-700 shadow-inner"
            : "bg-gray-300 hover:bg-gray-400 shadow-inner",

          // Size
          sizeClasses[size],

          className
        )}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        role="switch"
        aria-checked={isDark}
      >
        {/* Switch Track */}
        <div className="relative w-full h-full">
          {/* Switch Thumb */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 bg-white rounded-full",
              "shadow-md transition-all duration-300 ease-out",
              "flex items-center justify-center",
              switchThumbSizes[size],
              switchTranslations[size]
            )}
          >
            {/* Icons in thumb */}
            <Sun
              className={cn(
                "absolute transition-all duration-300",
                size === "xs"
                  ? "w-2 h-2"
                  : size === "sm"
                  ? "w-2.5 h-2.5"
                  : size === "md"
                  ? "w-3 h-3"
                  : size === "lg"
                  ? "w-3.5 h-3.5"
                  : "w-4 h-4",
                isDark
                  ? "opacity-0 scale-0 text-amber-500"
                  : "opacity-100 scale-100 text-amber-600"
              )}
            />
            <Moon
              className={cn(
                "absolute transition-all duration-300",
                size === "xs"
                  ? "w-2 h-2"
                  : size === "sm"
                  ? "w-2.5 h-2.5"
                  : size === "md"
                  ? "w-3 h-3"
                  : size === "lg"
                  ? "w-3.5 h-3.5"
                  : "w-4 h-4",
                isDark
                  ? "opacity-100 scale-100 text-blue-600"
                  : "opacity-0 scale-0 text-gray-600"
              )}
            />
          </div>
        </div>
      </button>
    );
  }

  // Default button variant - modern card-style button
  return (
    <button
      onClick={handleToggle}
      className={cn(
        // Base button styles with modern card appearance
        "relative rounded-xl transition-all duration-300 ease-out",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "hover:bg-gray-50 dark:hover:bg-gray-700",
        "shadow-sm hover:shadow-md",
        "focus:outline-none focus:ring-4 focus:ring-blue-500/20",
        "hover:scale-105 active:scale-95",
        "group",

        // Size
        sizeClasses[size],

        className
      )}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun icon for light mode */}
        <Sun
          className={cn(
            "absolute transition-all duration-500 ease-out",
            iconSizes[size],
            !isDark
              ? "opacity-100 scale-100 rotate-0 text-amber-500 group-hover:text-amber-600"
              : "opacity-0 scale-50 rotate-180 text-amber-400"
          )}
        />

        {/* Moon icon for dark mode */}
        <Moon
          className={cn(
            "absolute transition-all duration-500 ease-out",
            iconSizes[size],
            isDark
              ? "opacity-100 scale-100 rotate-0 text-blue-400 group-hover:text-blue-500"
              : "opacity-0 scale-50 -rotate-180 text-blue-500"
          )}
        />
      </div>
    </button>
  );
};
