import React, { createContext, useContext, useEffect, useState } from "react";

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

    // Fall back to system preference
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (error) {
      console.warn("Failed to read system theme preference:", error);
      return "light";
    }
  });

  // Apply theme to document root
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;

    // Remove any existing theme classes
    html.classList.remove("dark", "light");

    // For Tailwind CSS, we only need to add 'dark' class
    if (theme === "dark") {
      html.classList.add("dark");
    }

    // Set the color-scheme property for native browser styling
    html.style.colorScheme = theme;

    // Update theme-color meta tag dynamically
    const updateThemeColor = () => {
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        const color = theme === "dark" ? "#1f2937" : "#ffffff";
        themeColorMeta.setAttribute("content", color);
      }
    };
    updateThemeColor();

    // Save to localStorage
    try {
      localStorage.setItem("mockify-theme", theme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }

    // Dispatch event for other components that might listen
    window.dispatchEvent(
      new CustomEvent("theme-change", { detail: { theme } })
    );
  }, [theme]);

  // Ensure theme is applied on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Force apply theme on mount to handle any SSR/hydration issues
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    if (theme === "dark") {
      html.classList.add("dark");
    }
    html.style.colorScheme = theme;
  }, []); // Only run once on mount

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
