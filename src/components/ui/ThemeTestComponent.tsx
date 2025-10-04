import React from "react";

export const ThemeTestComponent: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    // Direct DOM manipulation to test
    const root = document.documentElement;
    if (newTheme) {
      root.classList.add("dark");
      console.log(
        "✅ Added dark class - classList:",
        root.classList.toString()
      );
    } else {
      root.classList.remove("dark");
      console.log(
        "✅ Removed dark class - classList:",
        root.classList.toString()
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            Theme Test
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Current: {isDark ? "Dark" : "Light"}
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
        >
          Toggle
        </button>
      </div>

      {/* Test elements */}
      <div className="mt-3 space-y-2">
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
          <span className="text-gray-900 dark:text-gray-100">
            Background test
          </span>
        </div>
        <div className="border border-gray-300 dark:border-gray-600 p-2 rounded text-sm">
          <span className="text-gray-700 dark:text-gray-300">Border test</span>
        </div>
      </div>
    </div>
  );
};
