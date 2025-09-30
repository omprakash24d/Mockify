import { AlertCircle } from "lucide-react";
import React from "react";
import type { ErrorBannerProps } from "../types";

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  error,
  onDismiss,
}) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl mx-8 mt-8 p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Something went wrong
          </h4>
          <p className="mt-2 text-red-800 dark:text-red-200 text-sm leading-relaxed">
            {error}
          </p>
          <button
            onClick={onDismiss}
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 text-sm font-medium rounded-xl transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};
