import React from "react";
import { cn } from "../../lib/utils";

interface NEETCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const NEETCard: React.FC<NEETCardProps> = ({
  children,
  hover = false,
  padding = "md",
  className,
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-12",
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm",
        paddingClasses[padding],
        hover &&
          "hover:shadow-lg dark:hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface NEETPageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
  children?: React.ReactNode;
}

export const NEETPageHeader: React.FC<NEETPageHeaderProps> = ({
  title,
  description,
  icon,
  gradient = true,
  children,
}) => {
  return (
    <div
      className={cn(
        "text-white py-8",
        gradient
          ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
          : "bg-blue-600 dark:bg-blue-700"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          {icon && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 dark:bg-white/10 rounded-2xl shadow-lg mb-6">
              {icon}
            </div>
          )}
          <h1 className="text-4xl lg:text-5xl font-bold">{title}</h1>
          {description && (
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
