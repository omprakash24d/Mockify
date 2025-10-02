import { Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "switch" | "minimal";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  size = "md",
  variant = "button",
}) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Listen for theme changes
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;

    const htmlElement = document.documentElement;
    const newIsDark = !isDark;

    if (newIsDark) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("mockify-theme", newIsDark ? "dark" : "light");

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("theme-change", {
        detail: { theme: newIsDark ? "dark" : "light" },
      })
    );

    setIsDark(newIsDark);
  };

  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  // Minimal variant
  if (variant === "minimal") {
    return (
      <button
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${className}`}
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

  // Switch variant
  if (variant === "switch") {
    const switchSize =
      size === "sm" ? "w-10 h-6" : size === "md" ? "w-12 h-7" : "w-14 h-8";
    const thumbSize =
      size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";
    const translation =
      size === "sm"
        ? isDark
          ? "translate-x-4"
          : "translate-x-0"
        : size === "md"
        ? isDark
          ? "translate-x-5"
          : "translate-x-0"
        : isDark
        ? "translate-x-6"
        : "translate-x-0";

    return (
      <button
        onClick={toggleTheme}
        className={`relative rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          isDark
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-300 hover:bg-gray-400"
        } ${switchSize} ${className}`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        role="switch"
        aria-checked={isDark}
      >
        <div
          className={`bg-white rounded-full shadow-md transition-transform duration-200 flex items-center justify-center ${thumbSize} ${translation}`}
        >
          <Sun
            className={`absolute transition-all duration-300 ${
              size === "sm"
                ? "w-2.5 h-2.5"
                : size === "md"
                ? "w-3 h-3"
                : "w-3.5 h-3.5"
            } ${
              !isDark
                ? "opacity-100 scale-100 text-amber-600"
                : "opacity-0 scale-50 text-amber-500"
            }`}
          />
          <Moon
            className={`absolute transition-all duration-300 ${
              size === "sm"
                ? "w-2.5 h-2.5"
                : size === "md"
                ? "w-3 h-3"
                : "w-3.5 h-3.5"
            } ${
              isDark
                ? "opacity-100 scale-100 text-blue-600"
                : "opacity-0 scale-50 text-gray-600"
            }`}
          />
        </div>
      </button>
    );
  }

  // Default button variant
  return (
    <button
      onClick={toggleTheme}
      className={`relative rounded-lg transition-colors duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${sizeClasses[size]} ${className}`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative flex items-center justify-center">
        <Sun
          className={`absolute transition-all duration-300 ${iconSizes[size]} ${
            !isDark
              ? "opacity-100 scale-100 text-amber-500"
              : "opacity-0 scale-50 text-amber-400"
          }`}
        />
        <Moon
          className={`absolute transition-all duration-300 ${iconSizes[size]} ${
            isDark
              ? "opacity-100 scale-100 text-blue-400"
              : "opacity-0 scale-50 text-blue-500"
          }`}
        />
      </div>
    </button>
  );
};
