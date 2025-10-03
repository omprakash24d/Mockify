import { CheckCircle } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import type { ProgressStepsProps } from "../types";

interface ExtendedProgressStepsProps extends ProgressStepsProps {
  onStepClick?: (stepId: number) => void;
}

export const ProgressSteps: React.FC<ExtendedProgressStepsProps> = ({
  steps,
  currentStep,
  stepLoading,
  onStepClick,
}) => {
  const getStepColors = (stepId: number) => {
    switch (stepId) {
      case 1:
        return {
          bg: "bg-blue-500",
          border: "border-blue-200",
          line: "bg-blue-200",
        };
      case 2:
        return {
          bg: "bg-indigo-500",
          border: "border-indigo-200",
          line: "bg-indigo-200",
        };
      case 3:
        return {
          bg: "bg-purple-500",
          border: "border-purple-200",
          line: "bg-purple-200",
        };
      case 4:
        return {
          bg: "bg-emerald-500",
          border: "border-emerald-200",
          line: "bg-emerald-200",
        };
      default:
        return {
          bg: "bg-slate-500",
          border: "border-slate-200",
          line: "bg-slate-200",
        };
    }
  };

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;
          const colors = getStepColors(step.id);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  disabled={!onStepClick || stepLoading[step.id]}
                  className={cn(
                    "w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 relative shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:hover:scale-100",
                    isCompleted &&
                      "bg-gradient-to-br from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700",
                    isCurrent &&
                      `bg-gradient-to-br ${colors.bg.replace(
                        "bg-",
                        "from-"
                      )} to-${
                        colors.bg.split("-")[1]
                      }-600 text-white scale-110 shadow-2xl hover:scale-115`,
                    isUpcoming &&
                      "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-400",
                    !onStepClick && "cursor-default",
                    onStepClick && !stepLoading[step.id] && "cursor-pointer"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10" />
                  ) : (
                    <StepIcon className="w-8 h-8 lg:w-10 lg:h-10" />
                  )}

                  {/* Loading spinner for current step */}
                  {isCurrent && stepLoading[step.id] && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/30 border-t-white animate-spin"></div>
                  )}
                </button>

                {/* Step Info */}
                <div className="mt-4 text-center max-w-32">
                  <div
                    className={cn(
                      "text-sm lg:text-base font-bold transition-colors duration-300",
                      isCompleted || isCurrent
                        ? "text-slate-900 dark:text-slate-100"
                        : "text-slate-500 dark:text-slate-500"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs lg:text-sm text-slate-500 dark:text-slate-500 mt-1 hidden sm:block leading-tight">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-6 hidden sm:block">
                  <div className="relative">
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div
                      className={cn(
                        "absolute top-0 left-0 h-1 rounded-full transition-all duration-500",
                        currentStep > step.id
                          ? "w-full bg-gradient-to-r from-emerald-400 to-green-500"
                          : currentStep === step.id
                          ? `w-1/2 bg-gradient-to-r ${colors.bg.replace(
                              "bg-",
                              "from-"
                            )} to-${colors.bg.split("-")[1]}-400`
                          : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
