import React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  variant?: "default" | "filled" | "outlined";
  inputSize?: "sm" | "md" | "lg";
}

const inputVariants = {
  default: [
    "bg-white border border-gray-300",
    "dark:bg-gray-900 dark:border-gray-600",
    "focus:bg-white dark:focus:bg-gray-900",
    "hover:border-gray-400 dark:hover:border-gray-500",
  ].join(" "),

  filled: [
    "bg-gray-100 border border-transparent",
    "dark:bg-gray-800 dark:border-transparent",
    "focus:bg-white focus:border-gray-300",
    "dark:focus:bg-gray-900 dark:focus:border-gray-600",
    "hover:bg-gray-50 dark:hover:bg-gray-700",
  ].join(" "),

  outlined: [
    "bg-transparent border-2 border-gray-300",
    "dark:border-gray-600",
    "focus:bg-white dark:focus:bg-gray-900",
    "hover:border-gray-400 dark:hover:border-gray-500",
  ].join(" "),
};

const inputSizes = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-4 py-3 text-base min-h-[44px]",
  lg: "px-5 py-4 text-lg min-h-[52px]",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      rightElement,
      variant = "default",
      inputSize = "md",
      className,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium font-inter",
              hasError
                ? "text-red-600 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300",
              disabled && "opacity-60"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <div
              className={cn(
                "absolute top-1/2 transform -translate-y-1/2",
                inputSize === "sm"
                  ? "left-3"
                  : inputSize === "lg"
                  ? "left-5"
                  : "left-4",
                hasError
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400",
                disabled && "opacity-60"
              )}
            >
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              // Base styles
              "w-full font-inter rounded-xl transition-all duration-200 ease-out",
              "focus:outline-none focus:ring-3 focus:ring-opacity-20",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
              "text-gray-900 dark:text-gray-100",

              // Size styles
              inputSizes[inputSize],

              // Icon padding
              icon &&
                (inputSize === "sm"
                  ? "pl-10"
                  : inputSize === "lg"
                  ? "pl-12"
                  : "pl-11"),
              rightElement &&
                (inputSize === "sm"
                  ? "pr-10"
                  : inputSize === "lg"
                  ? "pr-12"
                  : "pr-11"),

              // Variant styles
              !hasError && inputVariants[variant],

              // Error styles
              hasError &&
                [
                  "border-red-300 bg-red-50",
                  "dark:border-red-600 dark:bg-red-900/20",
                  "focus:border-red-500 focus:ring-red-500/20",
                ].join(" "),

              // Success focus (when no error)
              !hasError && "focus:border-blue-500 focus:ring-blue-500/20",

              // Disabled styles
              disabled &&
                [
                  "opacity-60 cursor-not-allowed",
                  "bg-gray-100 dark:bg-gray-800",
                  "border-gray-200 dark:border-gray-700",
                ].join(" "),

              // Custom styles
              className
            )}
            {...props}
          />

          {/* Right Element */}
          {rightElement && (
            <div
              className={cn(
                "absolute top-1/2 transform -translate-y-1/2",
                inputSize === "sm"
                  ? "right-3"
                  : inputSize === "lg"
                  ? "right-5"
                  : "right-4",
                disabled && "opacity-60"
              )}
            >
              {rightElement}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {(error || hint) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm font-inter text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}
            {hint && !error && (
              <p className="text-sm font-inter text-gray-600 dark:text-gray-400">
                {hint}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
