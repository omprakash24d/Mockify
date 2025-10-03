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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Responsive icon/button sizes using Tailwind only
  const iconSize =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  const btnSize =
    size === "sm" ? "px-2 py-1" : size === "lg" ? "px-4 py-2" : "px-3 py-1.5";

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`
        inline-flex items-center gap-2 rounded transition-colors
        ${btnSize}
        font-medium text-gray-600 dark:text-gray-300 
        hover:bg-blue-100 dark:hover:bg-blue-800
        focus:outline-none focus:ring-2 focus:ring-blue-500/20
        ${className}
      `}
    >
      {isDark ? (
        <>
          <Moon className={iconSize} />
          {/* <span className="hidden sm:inline">Dark</span> */}
        </>
      ) : (
        <>
          <Sun className={iconSize} />
          {/* <span className="hidden sm:inline">Light</span> */}
        </>
      )}
    </button>
  );
};
