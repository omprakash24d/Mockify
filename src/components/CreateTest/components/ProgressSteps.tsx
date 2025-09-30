import { CheckCircle } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import type { ProgressStepsProps } from "../types";

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  stepLoading,
}) => (
  <div className="mb-8">
    <div className="flex items-center justify-between max-w-4xl mx-auto">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isUpcoming = currentStep < step.id;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all duration-300 relative",
                  isCompleted && "bg-green-500 text-white shadow-lg",
                  isCurrent &&
                    `bg-${step.color}-500 text-white shadow-lg scale-110`,
                  isUpcoming &&
                    "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-2 text-gray-600 dark:text-gray-400 transition-colors duration-300"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7" />
                ) : (
                  <StepIcon className="w-6 h-6 lg:w-7 lg:h-7" />
                )}

                {/* Loading spinner for current step */}
                {isCurrent && stepLoading[step.id] && (
                  <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                )}
              </div>

              {/* Step Info */}
              <div className="mt-3 text-center max-w-28">
                <div
                  className={cn(
                    "text-sm font-semibold transition-colors duration-300",
                    isCompleted || isCurrent
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 hidden sm:block transition-colors duration-300">
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 hidden sm:block">
                <div
                  className={cn(
                    "h-0.5 transition-all duration-300",
                    currentStep > step.id
                      ? "bg-green-500"
                      : currentStep === step.id
                      ? `bg-${step.color}-200`
                      : "border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
