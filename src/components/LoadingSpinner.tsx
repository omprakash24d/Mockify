interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  subMessage = "Please wait while we prepare your content.",
  size = "md",
  fullScreen = true,
  showCancel = false,
  onCancel,
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const containerClasses = fullScreen
    ? "min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400 mx-auto ${sizeClasses[size]}`}
          aria-hidden="true"
        ></div>
        <span className="sr-only">Loading content</span>
        <h2
          className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100"
          aria-live="polite"
        >
          {message}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {subMessage}
        </p>
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            aria-label="Cancel loading"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
