import { Moon, Sun } from "lucide-react";
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

export const ThemeIndicator: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200">
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Theme:{" "}
            <span className="font-mono text-blue-600 dark:text-blue-400">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-3 h-3 text-yellow-500" />
          ) : (
            <Moon className="w-3 h-3 text-blue-500" />
          )}
        </button>
      </div>
    </div>
  );
};
