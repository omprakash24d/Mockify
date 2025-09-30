import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { DashboardError } from "./components/DashboardError";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardLoading } from "./components/DashboardLoading";
import { useDashboardData } from "./hooks/useDashboardData";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading, error, recentTests, loadDashboardData } =
    useDashboardData();

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return <DashboardError error={error} onRetry={loadDashboardData} />;
  }

  return (
    <DashboardLayout user={user} stats={stats} recentTests={recentTests} />
  );
};
