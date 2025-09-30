/**
 * Security Dashboard Header Component
 */

import { RefreshCw, Shield } from "lucide-react";
import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Button } from "../../ui/Button";

interface DashboardHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  loading,
}) => {
  const { classes } = useTheme();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className={`text-3xl font-bold ${classes.text.primary} flex items-center gap-2`}
        >
          <Shield className="h-8 w-8" />
          Security Dashboard
        </h1>
        <p className={`${classes.text.secondary} mt-1`}>
          Monitor security events and system health
        </p>
      </div>
      <Button
        onClick={onRefresh}
        disabled={loading}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
};

export default DashboardHeader;
