import { RefreshCw } from "lucide-react";
import React from "react";
import type { LoadingStateProps } from "../types";

export const LoadingState: React.FC<LoadingStateProps> = ({ currentStep }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-pulse" />
      </div>
    </div>
    <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {currentStep === 4 ? "Generating your test..." : "Loading data..."}
    </h3>
    <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md transition-colors duration-300">
      {currentStep === 4
        ? "We're creating your personalized test based on your selections. This may take a moment."
        : "Please wait while we load the latest content from our database."}
    </p>
  </div>
);
