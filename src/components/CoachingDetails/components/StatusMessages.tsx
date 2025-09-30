import { AlertTriangle, CheckCircle2 } from "lucide-react";
import React from "react";
import type { StatusMessageProps } from "../types";

export const StatusMessages: React.FC<StatusMessageProps> = ({
  isFormValid,
}) => {
  if (!isFormValid) {
    return (
      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Complete required fields to proceed
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Fill in your institute name and phone number to continue with the
              setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <p className="text-sm font-medium text-green-900 dark:text-green-100">
          Ready to complete your profile setup
        </p>
      </div>
    </div>
  );
};
