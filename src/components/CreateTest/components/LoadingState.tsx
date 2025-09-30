import { RefreshCw } from "lucide-react";
import React from "react";
import type { LoadingStateProps } from "../types";

export const LoadingState: React.FC<LoadingStateProps> = ({ currentStep }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative mb-8">
      <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-pulse" />
      </div>
    </div>
    <div className="text-center space-y-4 max-w-lg">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {currentStep === 4 ? "Generating your test..." : "Loading data..."}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
        {currentStep === 4
          ? "We're creating your personalized test based on your selections. This may take a moment."
          : "Please wait while we load the latest content from our database."}
      </p>
      <div className="flex items-center justify-center space-x-2 mt-6">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  </div>
);
