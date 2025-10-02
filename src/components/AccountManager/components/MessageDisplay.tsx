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
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!showError && !showSuccess) return null;

  return (
    <div className="space-y-3">
      {/* Error Message */}
      {showError && error && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />

          <p className="flex-1 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>

          <button
            onClick={() => setShowError(false)}
            className="flex-shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-800/50 transition"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && success && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />

          <p className="flex-1 text-sm text-green-700 dark:text-green-300">
            {success}
          </p>

          <button
            onClick={() => setShowSuccess(false)}
            className="flex-shrink-0 p-1 rounded hover:bg-green-100 dark:hover:bg-green-800/50 transition"
            aria-label="Dismiss success"
          >
            <X className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      )}
    </div>
  );
}
