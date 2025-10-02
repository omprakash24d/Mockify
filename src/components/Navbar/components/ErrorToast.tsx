import { AlertCircle, X } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ErrorToastProps {
  error: string | null;
  onDismiss: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-slide-down">
      <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle
              className="w-4 h-4 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
              Sign Out Error
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>

          <button
            onClick={onDismiss}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg transition",
              "text-red-500 hover:text-red-600 hover:bg-red-100",
              "dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500"
            )}
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};
