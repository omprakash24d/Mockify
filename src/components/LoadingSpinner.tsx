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
  loadingStage?: string;
  estimatedTime?: number;
  hasError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  timeout?: number; // in milliseconds, default 30000
}

// Memoized spinner variants for better performance
const SpinVariant = React.memo(({ config }: { config: any }) => (
  <div
    className={cn(
      config.spinner,
      "border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin dark:border-gray-700 dark:border-t-blue-500"
    )}
  />
));
SpinVariant.displayName = "SpinVariant";

const DotsVariant = React.memo(() => (
  <div className="flex gap-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
));
DotsVariant.displayName = "DotsVariant";

const PulseVariant = React.memo(({}: { config: any }) => (
  <div className="flex gap-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          "w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse"
        )}
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
));
PulseVariant.displayName = "PulseVariant";

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(
  ({
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
    loadingStage,
    estimatedTime,
    hasError = false,
    errorMessage,
    onRetry,
    timeout = 30000,
  }) => {
    const [hasTimedOut, setHasTimedOut] = React.useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] =
      React.useState(false);

    // Check for reduced motion preference
    React.useEffect(() => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Timeout handler
    React.useEffect(() => {
      if (timeout <= 0) return;

      const timer = setTimeout(() => {
        setHasTimedOut(true);
      }, timeout);

      return () => clearTimeout(timer);
    }, [timeout]);

    const sizes = {
      sm: { spinner: "w-6 h-6", text: "text-sm", gap: "space-y-2" },
      md: { spinner: "w-8 h-8", text: "text-base", gap: "space-y-3" },
      lg: { spinner: "w-12 h-12", text: "text-lg", gap: "space-y-4" },
    };

    const config = sizes[size];

    const renderSpinner = () => {
      // If user prefers reduced motion, show static indicator
      if (prefersReducedMotion) {
        return (
          <div
            className={cn(
              config.spinner,
              "border-4 border-gray-300 border-t-blue-600 rounded-full dark:border-gray-600 dark:border-t-blue-500"
            )}
          />
        );
      }

      if (variant === "dots") {
        return <DotsVariant />;
      }

      if (variant === "pulse") {
        return <PulseVariant config={config} />;
      }

      return <SpinVariant config={config} />;
    };

    const containerClass = fullScreen
      ? "fixed inset-0 z-50 flex items-center justify-center bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm neet-prep-font"
      : "flex items-center justify-center p-8 neet-prep-font";

    return (
      <div
        className={cn(containerClass, className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-describedby={subMessage ? "loading-submessage" : undefined}
      >
        <div className={cn("text-center max-w-sm w-full", config.gap)}>
          {/* Error State */}
          {hasError ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div
                  className={cn(
                    config.spinner,
                    "border-4 border-red-200 border-t-red-600 rounded-full dark:border-red-900 dark:border-t-red-500"
                  )}
                />
              </div>
              <h2
                className={cn(
                  config.text,
                  "font-semibold text-red-600 dark:text-red-400 mb-2"
                )}
              >
                {errorMessage || "Something went wrong"}
              </h2>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Retry loading"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Spinner */}
              <div className="flex justify-center mb-4">{renderSpinner()}</div>

              <span className="sr-only">{message}</span>

              {/* Message */}
              <h2
                id="loading-message"
                className={cn(
                  config.text,
                  "font-semibold text-gray-900 dark:text-gray-100"
                )}
              >
                {message}
              </h2>

              {/* Sub Message */}
              {subMessage && (
                <p
                  id="loading-submessage"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {subMessage}
                </p>
              )}

              {/* Loading Stage */}
              {loadingStage && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  {loadingStage}
                </p>
              )}

              {/* Estimated Time */}
              {estimatedTime && estimatedTime > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Estimated time: ~{estimatedTime}s
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
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500 ease-out rounded-full shadow-sm"
                      style={{
                        width: `${Math.min(100, Math.max(0, progress))}%`,
                      }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Loading progress: ${Math.round(progress)}%`}
                    />
                  </div>
                </div>
              )}

              {/* Timeout Warning */}
              {hasTimedOut && !hasError && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    This is taking longer than expected. Please wait or try
                    again.
                  </p>
                </div>
              )}

              {/* Cancel Button */}
              {showCancel && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Cancel loading"
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";
