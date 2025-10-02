import React from "react";
import { cn } from "../../lib/utils";

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = "default",
  className,
}) => {
  const variantStyles = {
    default:
      "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-200",
    destructive:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200",
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-200",
  };

  return (
    <div
      className={cn(
        "border rounded-lg p-3 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
