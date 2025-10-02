import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MessageDisplayProps {
  error?: string;
  success?: string;
}

export function MessageDisplay({ error, success }: MessageDisplayProps) {
  const [showError, setShowError] = useState(!!error);
  const [showSuccess, setShowSuccess] = useState(!!success);

  useEffect(() => {
    setShowError(!!error);
  }, [error]);

  useEffect(() => {
    setShowSuccess(!!success);
    if (success) {
      // Auto-hide success messages after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!showError && !showSuccess) return null;

  return (
    <div className="px-6 sm:px-8 pb-4 space-y-3">
      {/* Error Message */}
      {showError && error && (
        <div
          className={`
          relative flex items-start space-x-3 p-4 rounded-2xl border-2
          bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-slide-down
          shadow-soft hover:shadow-lg transition-all duration-300
        `}
        >
          <div className="flex-shrink-0 p-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Action Required
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              {error}
            </p>
          </div>

          <button
            onClick={() => setShowError(false)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
            aria-label="Dismiss error message"
          >
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && success && (
        <div
          className={`
          relative flex items-start space-x-3 p-4 rounded-2xl border-2
          bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 animate-slide-down
          shadow-soft hover:shadow-lg transition-all duration-300
        `}
        >
          <div className="flex-shrink-0 p-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
              Success!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
              {success}
            </p>
          </div>

          <button
            onClick={() => setShowSuccess(false)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200"
            aria-label="Dismiss success message"
          >
            <X className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>

          {/* Auto-dismiss progress bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-green-300 dark:bg-green-600 rounded-full animate-[shrink_5s_linear_forwards]" />
        </div>
      )}

      {/* Custom animation for progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
