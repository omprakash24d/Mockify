import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "elevated" | "outlined" | "ghost";
  interactive?: boolean;
}

const paddings = {
  none: "",
  xs: "p-3",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

const variants = {
  default:
    "bg-white border border-gray-200 shadow dark:bg-gray-900 dark:border-gray-800",
  elevated:
    "bg-white border border-gray-100 shadow-lg dark:bg-gray-900 dark:border-gray-800",
  outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
  ghost:
    "bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  variant = "default",
  interactive = false,
}) => {
  return (
    <div
      className={cn(
        "rounded-lg transition-all",
        variants[variant],
        paddings[padding],
        interactive &&
          "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      {...(interactive && { tabIndex: 0, role: "button" })}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  divided = true,
}) => {
  return (
    <div
      className={cn(
        divided
          ? "border-b border-gray-200 pb-4 mb-6 dark:border-gray-700"
          : "mb-4",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const titleSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  size = "md",
}) => {
  return (
    <h3
      className={cn(
        "font-semibold text-gray-900 dark:text-gray-100",
        titleSizes[size],
        className
      )}
    >
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p
      className={cn("text-sm text-gray-600 dark:text-gray-400 mt-1", className)}
    >
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("text-gray-700 dark:text-gray-300", className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  divided = false,
}) => {
  return (
    <div
      className={cn(
        divided
          ? "border-t border-gray-200 pt-4 mt-6 dark:border-gray-700"
          : "mt-4",
        className
      )}
    >
      {children}
    </div>
  );
};
