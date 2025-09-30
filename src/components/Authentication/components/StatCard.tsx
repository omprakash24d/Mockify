/**
 * Security Statistics Card Component
 */

import type { LucideIcon } from "lucide-react";
import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
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
  const { classes } = useTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case "error":
        return {
          border: classes.border.error,
          text: classes.text.error,
        };
      case "warning":
        return {
          border: classes.border.warning,
          text: classes.text.warning,
        };
      case "success":
        return {
          border: classes.border.success,
          text: classes.text.success,
        };
      default:
        return {
          border: classes.border.default,
          text: classes.text.accent,
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <Card className={`p-6 ${classes.bg.primary} ${variantClasses.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${classes.text.secondary}`}>
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
