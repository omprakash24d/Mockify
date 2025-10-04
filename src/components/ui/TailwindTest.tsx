import React from "react";

export const TailwindTest: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-red-500 dark:bg-red-600 text-white rounded-lg shadow-lg border border-red-400 dark:border-red-500 transition-all duration-200">
      <h3 className="font-bold">🎨 Theme Test</h3>
      <p className="text-sm">
        Tailwind + Theme working! This should change colors when toggling theme.
      </p>
      <div className="mt-2 flex gap-2">
        <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded transition-colors"></div>
        <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded transition-colors"></div>
        <div className="w-4 h-4 bg-yellow-500 dark:bg-yellow-400 rounded transition-colors"></div>
      </div>
      <div className="mt-2 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded transition-colors">
        Background should change with theme
      </div>
    </div>
  );
};
