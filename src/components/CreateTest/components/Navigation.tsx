import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import type { NavigationProps } from "../types";

export const Navigation: React.FC<NavigationProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  onNextStep,
  onPrevStep,
}) => (
  <div className="px-6 lg:px-8 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div className="flex items-center justify-between">
      <button
        onClick={onPrevStep}
        disabled={currentStep === 1}
        className={cn(
          "flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200",
          currentStep === 1
            ? "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50"
            : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 hover:scale-105 shadow-md hover:shadow-lg"
        )}
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Previous</span>
      </button>

      {/* Step Indicator */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Step {currentStep} of {totalSteps}
        </span>
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index + 1 <= currentStep
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onNextStep}
        disabled={!canProceed || currentStep === totalSteps}
        className={cn(
          "flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200",
          !canProceed || currentStep === totalSteps
            ? "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white hover:scale-105 shadow-md hover:shadow-lg"
        )}
      >
        <span>{currentStep === totalSteps ? "Complete" : "Next Step"}</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);
