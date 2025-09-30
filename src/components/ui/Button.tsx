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
    "bg-blue-600 text-white border-blue-600",
    // Hover styles
    "hover:bg-blue-700 hover:border-blue-700",
    // Active styles
    "active:bg-blue-800 active:border-blue-800",
    // Focus styles
    "focus:ring-blue-500/20",
    // Dark mode
    "dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800",
    // Shadow
    "shadow-lg hover:shadow-xl",
  ].join(" "),

  secondary: [
    "bg-gray-100 text-gray-900 border-gray-200",
    "hover:bg-gray-200 hover:border-gray-300",
    "active:bg-gray-300 active:border-gray-400",
    "focus:ring-gray-500/20",
    "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
    "dark:hover:bg-gray-700 dark:hover:border-gray-600",
    "dark:active:bg-gray-600 dark:active:border-gray-500",
    "shadow-md hover:shadow-lg",
  ].join(" "),

  outline: [
    "bg-transparent text-gray-700 border-gray-300",
    "hover:bg-gray-50 hover:border-gray-400",
    "active:bg-gray-100 active:border-gray-500",
    "focus:ring-gray-500/20",
    "dark:text-gray-300 dark:border-gray-600",
    "dark:hover:bg-gray-800 dark:hover:border-gray-500",
    "dark:active:bg-gray-700 dark:active:border-gray-400",
    "shadow-md hover:shadow-lg",
  ].join(" "),

  ghost: [
    "bg-transparent text-gray-700 border-transparent",
    "hover:bg-gray-100",
    "active:bg-gray-200",
    "focus:ring-gray-500/20",
    "dark:text-gray-300",
    "dark:hover:bg-gray-800",
    "dark:active:bg-gray-700",
  ].join(" "),

  danger: [
    "bg-red-600 text-white border-red-600",
    "hover:bg-red-700 hover:border-red-700",
    "active:bg-red-800 active:border-red-800",
    "focus:ring-red-500/20",
    "dark:bg-red-600 dark:hover:bg-red-700 dark:active:bg-red-800",
    "shadow-lg hover:shadow-xl",
  ].join(" "),

  success: [
    "bg-green-600 text-white border-green-600",
    "hover:bg-green-700 hover:border-green-700",
    "active:bg-green-800 active:border-green-800",
    "focus:ring-green-500/20",
    "dark:bg-green-600 dark:hover:bg-green-700 dark:active:bg-green-800",
    "shadow-lg hover:shadow-xl",
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
        "dark:focus:ring-offset-gray-900",

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
