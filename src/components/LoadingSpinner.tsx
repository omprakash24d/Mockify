import React from "react";

interface LoadingSpinnerProps {
  /** Main loading message */
  message?: string;
  /** Secondary descriptive message */
  subMessage?: string;
  /** Size variant of the spinner */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Animation type for the spinner */
  variant?: "spin" | "pulse" | "bounce" | "dots" | "bars" | "ring";
  /** Whether to show as full screen overlay */
  fullScreen?: boolean;
  /** Show cancel button */
  showCancel?: boolean;
  /** Cancel button callback */
  onCancel?: () => void;
  /** Custom color theme using Tailwind colors */
  color?:
    | "blue"
    | "purple"
    | "green"
    | "red"
    | "yellow"
    | "indigo"
    | "pink"
    | "gray";
  /** Show progress indicator */
  showProgress?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Custom className for additional styling */
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
  color = "blue",
  showProgress = false,
  progress = 0,
  className = "",
}) => {
  // Size configurations
  const sizeConfig = {
    xs: {
      spinner: "h-4 w-4",
      text: "text-sm",
      subText: "text-xs",
      spacing: "space-y-2",
      padding: "p-4",
    },
    sm: {
      spinner: "h-6 w-6",
      text: "text-base",
      subText: "text-sm",
      spacing: "space-y-3",
      padding: "p-6",
    },
    md: {
      spinner: "h-8 w-8",
      text: "text-lg",
      subText: "text-sm",
      spacing: "space-y-4",
      padding: "p-8",
    },
    lg: {
      spinner: "h-12 w-12",
      text: "text-xl",
      subText: "text-base",
      spacing: "space-y-5",
      padding: "p-10",
    },
    xl: {
      spinner: "h-16 w-16",
      text: "text-2xl",
      subText: "text-lg",
      spacing: "space-y-6",
      padding: "p-12",
    },
  };

  // Color configurations
  const colorConfig = {
    blue: {
      primary: "text-blue-600 dark:text-blue-400",
      secondary: "text-blue-500 dark:text-blue-300",
      border: "border-blue-600 dark:border-blue-400",
      bg: "bg-blue-600 dark:bg-blue-400",
      ring: "ring-blue-200 dark:ring-blue-800",
    },
    purple: {
      primary: "text-purple-600 dark:text-purple-400",
      secondary: "text-purple-500 dark:text-purple-300",
      border: "border-purple-600 dark:border-purple-400",
      bg: "bg-purple-600 dark:bg-purple-400",
      ring: "ring-purple-200 dark:ring-purple-800",
    },
    green: {
      primary: "text-green-600 dark:text-green-400",
      secondary: "text-green-500 dark:text-green-300",
      border: "border-green-600 dark:border-green-400",
      bg: "bg-green-600 dark:bg-green-400",
      ring: "ring-green-200 dark:ring-green-800",
    },
    red: {
      primary: "text-red-600 dark:text-red-400",
      secondary: "text-red-500 dark:text-red-300",
      border: "border-red-600 dark:border-red-400",
      bg: "bg-red-600 dark:bg-red-400",
      ring: "ring-red-200 dark:ring-red-800",
    },
    yellow: {
      primary: "text-yellow-600 dark:text-yellow-400",
      secondary: "text-yellow-500 dark:text-yellow-300",
      border: "border-yellow-600 dark:border-yellow-400",
      bg: "bg-yellow-600 dark:bg-yellow-400",
      ring: "ring-yellow-200 dark:ring-yellow-800",
    },
    indigo: {
      primary: "text-indigo-600 dark:text-indigo-400",
      secondary: "text-indigo-500 dark:text-indigo-300",
      border: "border-indigo-600 dark:border-indigo-400",
      bg: "bg-indigo-600 dark:bg-indigo-400",
      ring: "ring-indigo-200 dark:ring-indigo-800",
    },
    pink: {
      primary: "text-pink-600 dark:text-pink-400",
      secondary: "text-pink-500 dark:text-pink-300",
      border: "border-pink-600 dark:border-pink-400",
      bg: "bg-pink-600 dark:bg-pink-400",
      ring: "ring-pink-200 dark:ring-pink-800",
    },
    gray: {
      primary: "text-gray-600 dark:text-gray-400",
      secondary: "text-gray-500 dark:text-gray-300",
      border: "border-gray-600 dark:border-gray-400",
      bg: "bg-gray-600 dark:bg-gray-400",
      ring: "ring-gray-200 dark:ring-gray-800",
    },
  };

  const config = sizeConfig[size];
  const colors = colorConfig[color];

  // Spinner variants
  const renderSpinner = () => {
    const baseClasses = `${config.spinner} mx-auto`;

    switch (variant) {
      case "spin":
        return (
          <div
            className={`${baseClasses} animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 ${colors.border} border-t-transparent`}
            aria-hidden="true"
          />
        );

      case "pulse":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${config.spinner
                  .replace("h-", "h-")
                  .replace("w-", "w-")} rounded-full ${
                  colors.bg
                } animate-pulse`}
                style={{ animationDelay: `${i * 0.15}s` }}
                aria-hidden="true"
              />
            ))}
          </div>
        );

      case "bounce":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${config.spinner
                  .replace("h-", "h-")
                  .replace("w-", "w-")} rounded-full ${
                  colors.bg
                } animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
                aria-hidden="true"
              />
            ))}
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${colors.bg} animate-ping`}
                style={{ animationDelay: `${i * 0.2}s` }}
                aria-hidden="true"
              />
            ))}
          </div>
        );

      case "bars":
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 ${colors.bg} animate-pulse rounded-sm`}
                style={{
                  height: `${12 + (i % 3) * 8}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.8s",
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        );

      case "ring":
        return (
          <div className="relative">
            <div
              className={`${baseClasses} rounded-full border-2 border-gray-200 dark:border-gray-700`}
              aria-hidden="true"
            />
            <div
              className={`${baseClasses} absolute inset-0 rounded-full border-2 border-transparent ${colors.border} border-t-transparent animate-spin`}
              aria-hidden="true"
            />
          </div>
        );

      default:
        return (
          <div
            className={`${baseClasses} animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 ${colors.border} border-t-transparent`}
            aria-hidden="true"
          />
        );
    }
  };

  // Progress bar component
  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <div className="w-full max-w-xs mx-auto mt-4">
        <div className="flex justify-between items-center mb-2">
          <span
            className={`${config.subText} text-gray-600 dark:text-gray-400`}
          >
            Progress
          </span>
          <span
            className={`${config.subText} font-medium text-gray-900 dark:text-gray-100`}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all duration-300 ease-out rounded-full`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  };

  // Container classes
  const containerClasses = fullScreen
    ? `fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm transition-all duration-200 ${className}`
    : `flex items-center justify-center ${config.padding} ${className}`;

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className={`text-center ${config.spacing} max-w-md mx-auto px-4`}>
        {/* Spinner */}
        <div className="flex justify-center mb-4">{renderSpinner()}</div>

        {/* Screen reader text */}
        <span className="sr-only">
          {message} {subMessage && `- ${subMessage}`}
        </span>

        {/* Main message */}
        <h2
          className={`${config.text} font-semibold text-gray-900 dark:text-gray-100 leading-tight`}
          aria-live="polite"
        >
          {message}
        </h2>

        {/* Sub message */}
        {subMessage && (
          <p
            className={`${config.subText} text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto`}
          >
            {subMessage}
          </p>
        )}

        {/* Progress bar */}
        {renderProgress()}

        {/* Cancel button */}
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            className={`
              mt-6 px-6 py-2 ${config.subText} font-medium 
              text-gray-600 dark:text-gray-400 
              hover:text-gray-900 dark:hover:text-gray-100
              hover:bg-gray-100 dark:hover:bg-gray-800
              rounded-lg border border-gray-300 dark:border-gray-600
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 ${colors.ring} focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950
              active:scale-95
            `}
            aria-label="Cancel loading operation"
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
