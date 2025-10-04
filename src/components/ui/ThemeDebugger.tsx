import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

export const ThemeDebugger: React.FC = () => {
  const { theme, toggleTheme, isLoading } = useTheme();

  return (
    <div
      className="fixed top-4 left-4 z-50 p-4 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-xl"
      style={{ minWidth: "250px" }}
    >
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
        Theme Debug Info
      </h3>
      <div className="space-y-1 text-xs">
        <div className="text-gray-600 dark:text-gray-400">
          Current Theme:{" "}
          <span className="font-mono text-blue-600 dark:text-blue-400">
            {theme}
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Loading:{" "}
          <span className="font-mono text-green-600 dark:text-green-400">
            {isLoading ? "true" : "false"}
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          HTML Class:{" "}
          <span className="font-mono text-purple-600 dark:text-purple-400">
            {document.documentElement.classList.contains("dark")
              ? "dark"
              : "light"}
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          LocalStorage:{" "}
          <span className="font-mono text-orange-600 dark:text-orange-400">
            {localStorage.getItem("theme") || "null"}
          </span>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="mt-3 w-full px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-medium transition-colors"
      >
        Toggle Theme ({theme === "dark" ? "Switch to Light" : "Switch to Dark"})
      </button>

      {/* Visual test elements */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Visual Tests:
        </div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded"></div>
          <div className="h-4 bg-green-100 dark:bg-green-900 rounded"></div>
        </div>
      </div>
    </div>
  );
};
