import React from "react";

interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 neet-prep-font flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neet-error-100 flex items-center justify-center">
            <div className="w-8 h-8 text-neet-error-600">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white focus:ring-blue-500 dark:focus:ring-blue-400 w-full py-3 text-lg"
            >
              Try Again
            </button>
            <button
              className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 dark:focus:ring-gray-400 w-full py-3 text-lg"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
