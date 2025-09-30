import { AlertCircle, X } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ErrorToastProps {
  error: string | null;
  onDismiss: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div
        className={cn(
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
          "border border-red-200/50 dark:border-red-800/50",
          "rounded-2xl p-4 shadow-soft-xl animate-slide-down"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <AlertCircle
                className="h-4 w-4 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
              Sign Out Error
            </h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-xl transition-all duration-200",
              "text-red-500 hover:text-red-600",
              "hover:bg-red-100 dark:hover:bg-red-900/50",
              "focus:outline-none focus:ring-2 focus:ring-red-500/20"
            )}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
