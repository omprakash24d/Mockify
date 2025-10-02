import { BarChart3, Database, Settings } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/Button";
import ExistingAdminDashboard from "./AdminDashboard";
import { AdminDashboardWidgets } from "./AdminDashboardWidgets";

interface EnhancedAdminDashboardProps {}

const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = () => {
  const [activeView, setActiveView] = useState<
    "dashboard" | "questions" | "analytics"
  >("dashboard");

  const handleNavigation = (route: string) => {
    if (route.includes("admin")) {
      setActiveView("questions");
    } else {
      // Handle other navigation
      console.log("Navigate to:", route);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <AdminDashboardWidgets onNavigate={handleNavigation} />;
      case "questions":
        return <ExistingAdminDashboard />;
      case "analytics":
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Advanced analytics coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return <AdminDashboardWidgets onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage questions, monitor performance, and track analytics
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mt-4 md:mt-0">
          <Button
            variant={activeView === "dashboard" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView("dashboard")}
            className="px-4"
          >
            <Database className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeView === "questions" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView("questions")}
            className="px-4"
          >
            <Settings className="w-4 h-4 mr-2" />
            Questions
          </Button>
          <Button
            variant={activeView === "analytics" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView("analytics")}
            className="px-4"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="transition-all duration-300 ease-in-out">
        {renderView()}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
