import React from "react";
import { cn } from "../lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spin" | "dots" | "pulse";
  fullScreen?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  subMessage,
  size = "md",
  variant = "spin",
  fullScreen = true,
  showCancel = false,
  onCancel,
  showProgress = false,
  progress = 0,
  className,
}) => {
  const sizes = {
    sm: { spinner: "w-6 h-6", text: "text-sm", gap: "space-y-2" },
    md: { spinner: "w-8 h-8", text: "text-base", gap: "space-y-3" },
    lg: { spinner: "w-12 h-12", text: "text-lg", gap: "space-y-4" },
  };

  const config = sizes[size];

  const renderSpinner = () => {
    if (variant === "dots") {
      return (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      );
    }

    if (variant === "pulse") {
      return (
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                config.spinner,
                "bg-blue-600 rounded-full animate-pulse"
              )}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className={cn(
          config.spinner,
          "border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin dark:border-gray-700"
        )}
      />
    );
  };

  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-gray-950/90"
    : "flex items-center justify-center p-8";

  return (
    <div
      className={cn(containerClass, className)}
      role="status"
      aria-live="polite"
    >
      <div className={cn("text-center max-w-sm", config.gap)}>
        {/* Spinner */}
        <div className="flex justify-center mb-4">{renderSpinner()}</div>

        <span className="sr-only">{message}</span>

        {/* Message */}
        <h2
          className={cn(
            config.text,
            "font-semibold text-gray-900 dark:text-gray-100"
          )}
        >
          {message}
        </h2>

        {/* Sub Message */}
        {subMessage && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subMessage}
          </p>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full mt-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cancel loading"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
