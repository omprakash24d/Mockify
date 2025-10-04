import { Moon, Sun } from "lucide-react";
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  size = "md",
}) => {
  const { theme, toggleTheme, isLoading } = useTheme();
  const isDark = theme === "dark";

  // Responsive icon/button sizes using Tailwind only
  const iconSize =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  const btnSize =
    size === "sm" ? "px-2 py-1" : size === "lg" ? "px-4 py-2" : "px-3 py-1.5";

  return (
    <button
      onClick={toggleTheme}
      disabled={isLoading}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`
        inline-flex items-center justify-center rounded-lg transition-all duration-200
        ${btnSize}
        font-medium text-gray-600 dark:text-gray-300 
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        shadow-sm hover:shadow
        ${className}
      `}
    >
      <div className="relative">
        {isDark ? (
          <Moon
            className={`${iconSize} transition-transform duration-200 ${
              isLoading ? "animate-pulse" : ""
            }`}
          />
        ) : (
          <Sun
            className={`${iconSize} transition-transform duration-200 ${
              isLoading ? "animate-pulse" : ""
            }`}
          />
        )}
      </div>
    </button>
  );
};
