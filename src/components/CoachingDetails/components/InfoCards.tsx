import { Info } from "lucide-react";
import React from "react";

export const InfoCards: React.FC = () => {
  return (
    <>
      {/* Info Card */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Profile Required
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              Complete your coaching institute profile to access all dashboard
              features. Your logo is optional and can be added later.
            </p>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-medium">Note:</span> If no logo is uploaded, a
          default institute icon will be used across the platform.
        </p>
      </div>
    </>
  );
};
