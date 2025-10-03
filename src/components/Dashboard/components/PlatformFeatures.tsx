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
    <div className="card-neet p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-neet-primary-50 rounded-lg flex items-center justify-center">
          <Star className="w-4 h-4 text-neet-primary-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Platform Features</h3>
      </div>

      <div className="space-y-3">
        {stats.recentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 group hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
          >
            <div className="w-2 h-2 bg-neet-success-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200 flex-shrink-0"></div>
            <span className="text-gray-700 text-sm leading-relaxed">
              {activity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
