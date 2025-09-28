import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: [
    // Base styles
    "bg-primary-500 text-white border-primary-500",
    // Hover styles
    "hover:bg-primary-600 hover:border-primary-600",
    // Active styles
    "active:bg-primary-700 active:border-primary-700",
    // Focus styles
    "focus:ring-primary-500/20",
    // Dark mode
    "dark:bg-primary-500 dark:hover:bg-primary-600 dark:active:bg-primary-700",
    // Shadow
    "shadow-soft hover:shadow-medium",
  ].join(" "),

  secondary: [
    "bg-neutral-100 text-neutral-900 border-neutral-200",
    "hover:bg-neutral-200 hover:border-neutral-300",
    "active:bg-neutral-300 active:border-neutral-400",
    "focus:ring-neutral-500/20",
    "dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700",
    "dark:hover:bg-neutral-700 dark:hover:border-neutral-600",
    "dark:active:bg-neutral-600 dark:active:border-neutral-500",
    "shadow-soft hover:shadow-medium",
  ].join(" "),

  outline: [
    "bg-transparent text-neutral-700 border-neutral-300",
    "hover:bg-neutral-50 hover:border-neutral-400",
    "active:bg-neutral-100 active:border-neutral-500",
    "focus:ring-neutral-500/20",
    "dark:text-neutral-300 dark:border-neutral-600",
    "dark:hover:bg-neutral-800 dark:hover:border-neutral-500",
    "dark:active:bg-neutral-700 dark:active:border-neutral-400",
    "shadow-soft hover:shadow-medium",
  ].join(" "),

  ghost: [
    "bg-transparent text-neutral-700 border-transparent",
    "hover:bg-neutral-100",
    "active:bg-neutral-200",
    "focus:ring-neutral-500/20",
    "dark:text-neutral-300",
    "dark:hover:bg-neutral-800",
    "dark:active:bg-neutral-700",
  ].join(" "),

  danger: [
    "bg-error-500 text-white border-error-500",
    "hover:bg-error-600 hover:border-error-600",
    "active:bg-error-700 active:border-error-700",
    "focus:ring-error-500/20",
    "dark:bg-error-500 dark:hover:bg-error-600 dark:active:bg-error-700",
    "shadow-soft hover:shadow-medium",
  ].join(" "),

  success: [
    "bg-success-500 text-white border-success-500",
    "hover:bg-success-600 hover:border-success-600",
    "active:bg-success-700 active:border-success-700",
    "focus:ring-success-500/20",
    "dark:bg-success-500 dark:hover:bg-success-600 dark:active:bg-success-700",
    "shadow-soft hover:shadow-medium",
  ].join(" "),
};

const buttonSizes = {
  xs: "px-2 py-1 text-xs font-medium min-h-[24px]",
  sm: "px-3 py-1.5 text-sm font-medium min-h-[32px]",
  md: "px-4 py-2 text-sm font-medium min-h-[40px]",
  lg: "px-6 py-3 text-base font-medium min-h-[48px]",
  xl: "px-8 py-4 text-lg font-medium min-h-[56px]",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const isInteractive = !disabled && !loading;

  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2",
        "font-inter font-medium rounded-xl border",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-3 focus:ring-offset-2",
        "dark:focus:ring-offset-neutral-900",

        // Interactive states
        isInteractive && "cursor-pointer",
        !isInteractive && "cursor-not-allowed opacity-60",

        // Variant styles
        buttonVariants[variant],

        // Size styles
        buttonSizes[size],

        // Full width
        fullWidth && "w-full",

        // Custom styles
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2
          className={cn(
            "animate-spin",
            size === "xs"
              ? "w-3 h-3"
              : size === "sm"
              ? "w-4 h-4"
              : size === "lg"
              ? "w-5 h-5"
              : size === "xl"
              ? "w-6 h-6"
              : "w-4 h-4"
          )}
        />
      )}
      {children}
    </button>
  );
};
