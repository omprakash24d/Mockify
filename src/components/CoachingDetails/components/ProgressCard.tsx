import { CheckCircle2, Circle } from "lucide-react";
import React from "react";
import type { ProgressCardProps } from "../types";
import { calculateProgress, getProgressItems } from "../utils/progress";

export const ProgressCard: React.FC<ProgressCardProps> = ({
  coachingName,
  phoneNumber,
  coachingLogo,
}) => {
  const progressItems = getProgressItems(
    coachingName,
    phoneNumber,
    coachingLogo
  );
  const completionPercentage = calculateProgress(coachingName, phoneNumber);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Setup Progress
        </h3>
      </div>

      <div className="space-y-3">
        {progressItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                item.isCompleted
                  ? "text-green-700 dark:text-green-400 font-medium"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Completion</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
