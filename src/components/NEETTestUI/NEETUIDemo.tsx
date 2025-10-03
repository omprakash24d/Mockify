import { Eye, Shield, User } from "lucide-react";
import React, { useState } from "react";
import { AdminDashboard } from "./AdminDashboard";
import { NEETTestUI } from "./index";

export const NEETUIDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<"student" | "admin">(
    "student"
  );

  return (
    <div className="relative">
      {/* View Switcher */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>View:</span>
          </span>
          <button
            onClick={() => setCurrentView("student")}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === "student"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student</span>
          </button>
          <button
            onClick={() => setCurrentView("admin")}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === "admin"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {currentView === "student" ? <NEETTestUI /> : <AdminDashboard />}
    </div>
  );
};
