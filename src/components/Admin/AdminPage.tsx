import React from "react";
import { AdminDashboard } from "./AdminDashboard";

export const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminDashboard />
    </div>
  );
};
