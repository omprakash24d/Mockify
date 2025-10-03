import type { User } from "firebase/auth";
import React from "react";
import type { Test } from "../../../types/schema";
import type { DashboardStats } from "../types";
import { PlatformFeatures } from "./PlatformFeatures";
import { QuickActions } from "./QuickActions";
import { RecentTests } from "./RecentTests";
import { StatisticsCards } from "./StatisticsCards";
import { StudyTips } from "./StudyTips";

interface DashboardLayoutProps {
  user: User | null;
  stats: DashboardStats;
  recentTests: Test[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  stats,
  recentTests,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 neet-prep-font">
      {/* NEET-style Header Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.displayName || "Student"}!
              </h1>
              <p className="text-blue-100">
                Continue your NEET preparation journey with personalized
                practice and progress tracking.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <StatisticsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Quick Actions & Recent Tests - Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <QuickActions />
            <RecentTests user={user} recentTests={recentTests} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <PlatformFeatures stats={stats} />
            <StudyTips />
          </div>
        </div>
      </div>
    </div>
  );
};
