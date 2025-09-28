import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "elevated" | "outlined" | "ghost";
  interactive?: boolean;
}

const paddingClasses = {
  none: "",
  xs: "p-3",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

const cardVariants = {
  default: [
    "bg-white border border-neutral-200",
    "dark:bg-neutral-900 dark:border-neutral-800",
    "shadow-soft",
  ].join(" "),

  elevated: [
    "bg-white border border-neutral-200/50",
    "dark:bg-neutral-900 dark:border-neutral-800/50",
    "shadow-soft-lg",
  ].join(" "),

  outlined: [
    "bg-transparent border-2 border-neutral-200",
    "dark:border-neutral-700",
  ].join(" "),

  ghost: [
    "bg-neutral-50/50 border border-neutral-100",
    "dark:bg-neutral-800/50 dark:border-neutral-700",
  ].join(" "),
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
        // Base styles
        "rounded-2xl transition-all duration-300 ease-out",

        // Variant styles
        cardVariants[variant],

        // Interactive styles
        interactive &&
          [
            "cursor-pointer",
            "hover:shadow-soft-lg hover:-translate-y-0.5",
            "active:translate-y-0 active:shadow-soft",
            "focus:outline-none focus:ring-3 focus:ring-primary-500/20",
          ].join(" "),

        // Padding
        paddingClasses[padding],

        // Custom styles
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
        divided &&
          [
            "border-b border-neutral-200 pb-4 mb-6",
            "dark:border-neutral-700",
          ].join(" "),
        !divided && "mb-4",
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
  sm: "text-base font-semibold",
  md: "text-lg font-semibold",
  lg: "text-xl font-bold",
  xl: "text-2xl font-bold",
};

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  size = "md",
}) => {
  return (
    <h3
      className={cn(
        "text-neutral-900 dark:text-neutral-100",
        "tracking-tight leading-tight",
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
      className={cn(
        "text-neutral-600 dark:text-neutral-400",
        "text-sm leading-relaxed mt-1",
        className
      )}
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
    <div className={cn("text-neutral-700 dark:text-neutral-300", className)}>
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
        divided &&
          [
            "border-t border-neutral-200 pt-4 mt-6",
            "dark:border-neutral-700",
          ].join(" "),
        !divided && "mt-4",
        className
      )}
    >
      {children}
    </div>
  );
};
