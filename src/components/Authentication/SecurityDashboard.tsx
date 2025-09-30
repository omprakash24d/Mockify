/**
 * Security Dashboard Main Component
 * Modular version organized within the Authentication folder structure
 */

import React from "react";
import {
  DashboardHeader,
  EventsList,
  SecurityTips,
  StatsGrid,
} from "./components";
import { useSecurityData } from "./hooks/useSecurityData";

export const SecurityDashboard: React.FC = () => {
  const { events, stats, loading, refetch } = useSecurityData();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <DashboardHeader onRefresh={refetch} loading={loading} />

      {/* Stats Cards */}
      <StatsGrid stats={stats} />

      {/* Recent Events */}
      <EventsList events={events} />

      {/* Security Tips */}
      <SecurityTips />
    </div>
  );
};

export default SecurityDashboard;
