import { AlertCircle } from "lucide-react";
import React from "react";
import type { ErrorBannerProps } from "../types";

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  error,
  onDismiss,
}) => {
  if (!error) return null;

  return (
    <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 px-6 py-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-red-800 dark:text-red-200">
            Something went wrong
          </h4>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={onDismiss}
            className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};
