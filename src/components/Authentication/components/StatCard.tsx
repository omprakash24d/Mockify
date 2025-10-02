/**
 * Security Statistics Card Component
 */

import type { LucideIcon } from "lucide-react";
import React from "react";
import { Card } from "../../ui/Card";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "default" | "error" | "warning" | "success";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = "default",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "error":
        return {
          border: "border-red-200 dark:border-red-700",
          text: "text-red-600 dark:text-red-400",
        };
      case "warning":
        return {
          border: "border-yellow-200 dark:border-yellow-700",
          text: "text-yellow-600 dark:text-yellow-400",
        };
      case "success":
        return {
          border: "border-green-200 dark:border-green-700",
          text: "text-green-600 dark:text-green-400",
        };
      default:
        return {
          border: "border-gray-200 dark:border-gray-700",
          text: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <Card className={`p-6 bg-white dark:bg-gray-900 ${variantClasses.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold ${variantClasses.text}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${variantClasses.text}`} />
      </div>
    </Card>
  );
};

export default StatCard;
