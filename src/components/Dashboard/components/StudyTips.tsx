import { Lightbulb } from "lucide-react";
import React from "react";
import { getStudyTips } from "../utils/dashboardUtils";

export const StudyTips: React.FC = () => {
  const studyTips = getStudyTips();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Study Tips
        </h3>
      </div>

      <div className="space-y-3">
        {studyTips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 bg-yellow-500 dark:bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {tip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
