import { Star } from "lucide-react";
import React from "react";
import type { DashboardStats } from "../types";

interface PlatformFeaturesProps {
  stats: DashboardStats;
}

export const PlatformFeatures: React.FC<PlatformFeaturesProps> = ({
  stats,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Platform Features
        </h3>
      </div>

      <div className="space-y-3">
        {stats.recentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
          >
            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200 flex-shrink-0"></div>
            <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {activity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
