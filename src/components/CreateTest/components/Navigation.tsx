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
  <div className="px-8 lg:px-12 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
    <div className="flex items-center justify-between">
      <button
        onClick={onPrevStep}
        disabled={currentStep === 1}
        className={cn(
          "flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300",
          currentStep === 1
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-slate-200 dark:border-slate-600"
        )}
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Previous</span>
      </button>

      {/* Step Indicator */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Step {currentStep} of {totalSteps}
        </span>
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index + 1 <= currentStep
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg"
                  : "bg-slate-300 dark:bg-slate-600"
              )}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onNextStep}
        disabled={!canProceed || currentStep === totalSteps}
        className={cn(
          "flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300",
          !canProceed || currentStep === totalSteps
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        )}
      >
        <span>{currentStep === totalSteps ? "Complete" : "Next Step"}</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);
