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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Advanced analytics and reporting features are coming soon.
                Monitor question performance, user engagement, and detailed
                insights.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>In Development</span>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminDashboardWidgets onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0">
              Manage questions, monitor performance, and track analytics
            </p>
          </div>

          {/* View Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <nav className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("dashboard")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeView === "dashboard"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Database className="w-5 h-5 mr-2" />
                Overview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("questions")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeView === "questions"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Settings className="w-5 h-5 mr-2" />
                Questions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("analytics")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeView === "analytics"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">{renderView()}</div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
