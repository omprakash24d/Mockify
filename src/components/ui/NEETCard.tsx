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
        "card-neet",
        paddingClasses[padding],
        hover &&
          "hover:shadow-neet-lg transform hover:-translate-y-1 transition-all duration-300",
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
          ? "bg-gradient-to-r from-neet-primary-500 to-neet-primary-600"
          : "bg-neet-primary-600"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          {icon && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl shadow-lg mb-6">
              {icon}
            </div>
          )}
          <h1 className="text-4xl lg:text-5xl font-bold">{title}</h1>
          {description && (
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
