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
    "bg-white border border-neutral-300",
    "dark:bg-neutral-900 dark:border-neutral-600",
    "focus:bg-white dark:focus:bg-neutral-900",
    "hover:border-neutral-400 dark:hover:border-neutral-500",
  ].join(" "),

  filled: [
    "bg-neutral-100 border border-transparent",
    "dark:bg-neutral-800 dark:border-transparent",
    "focus:bg-white focus:border-neutral-300",
    "dark:focus:bg-neutral-900 dark:focus:border-neutral-600",
    "hover:bg-neutral-50 dark:hover:bg-neutral-700",
  ].join(" "),

  outlined: [
    "bg-transparent border-2 border-neutral-300",
    "dark:border-neutral-600",
    "focus:bg-white dark:focus:bg-neutral-900",
    "hover:border-neutral-400 dark:hover:border-neutral-500",
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
                ? "text-error-600 dark:text-error-400"
                : "text-neutral-700 dark:text-neutral-300",
              disabled && "opacity-60"
            )}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
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
                  ? "text-error-500 dark:text-error-400"
                  : "text-neutral-500 dark:text-neutral-400",
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
              "placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
              "text-neutral-900 dark:text-neutral-100",

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
                  "border-error-300 bg-error-50",
                  "dark:border-error-600 dark:bg-error-900/20",
                  "focus:border-error-500 focus:ring-error-500/20",
                ].join(" "),

              // Success focus (when no error)
              !hasError && "focus:border-primary-500 focus:ring-primary-500/20",

              // Disabled styles
              disabled &&
                [
                  "opacity-60 cursor-not-allowed",
                  "bg-neutral-100 dark:bg-neutral-800",
                  "border-neutral-200 dark:border-neutral-700",
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
              <p className="text-sm font-inter text-error-600 dark:text-error-400 flex items-center gap-1">
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
              <p className="text-sm font-inter text-neutral-600 dark:text-neutral-400">
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
