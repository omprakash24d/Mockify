/**
 * Security Statistics Grid Component
 */

import { Activity, AlertTriangle, Lock, TrendingUp } from "lucide-react";
import React from "react";
import type { SecurityStats } from "../types";
import { StatCard } from "./StatCard";

interface StatsGridProps {
  stats: SecurityStats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Events"
        value={stats.totalEvents}
        icon={Activity}
        variant="default"
      />

      <StatCard
        title="Critical Events"
        value={stats.criticalEvents}
        icon={AlertTriangle}
        variant="error"
      />

      <StatCard
        title="High Severity"
        value={stats.highSeverityEvents}
        icon={TrendingUp}
        variant="warning"
      />

      <StatCard
        title="Recent Logins"
        value={stats.recentLoginAttempts}
        icon={Lock}
        variant="success"
      />
    </div>
  );
};

export default StatsGrid;
