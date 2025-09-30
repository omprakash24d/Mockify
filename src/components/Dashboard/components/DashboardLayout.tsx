import type { User } from "firebase/auth";
import React from "react";
import type { Test } from "../../../types/schema";
import type { DashboardStats } from "../types";
import { DashboardHero } from "./DashboardHero";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <DashboardHero user={user} stats={stats} />

        {/* Statistics Cards */}
        <StatisticsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions & Recent Tests - Main Column */}
          <div className="lg:col-span-2">
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
