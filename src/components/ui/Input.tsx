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

const variants = {
  default:
    "bg-white border border-gray-300 hover:border-gray-400 dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-500",
  filled:
    "bg-gray-50 border border-transparent hover:bg-gray-100 focus:bg-white focus:border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-900 dark:focus:border-gray-600",
  outlined:
    "bg-transparent border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-5 py-3 text-lg",
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

    const iconPadding = {
      sm: icon ? "pl-9" : "",
      md: icon ? "pl-10" : "",
      lg: icon ? "pl-12" : "",
    };

    const rightPadding = {
      sm: rightElement ? "pr-9" : "",
      md: rightElement ? "pr-10" : "",
      lg: rightElement ? "pr-12" : "",
    };

    const iconPosition = {
      sm: "left-3",
      md: "left-3",
      lg: "left-4",
    };

    const rightPosition = {
      sm: "right-3",
      md: "right-3",
      lg: "right-4",
    };

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium",
              hasError
                ? "text-red-600 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300",
              disabled && "opacity-60"
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 dark:text-red-400 ml-1">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                iconPosition[inputSize],
                hasError ? "text-red-500" : "text-gray-500 dark:text-gray-400",
                disabled && "opacity-60"
              )}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              "w-full rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-gray-900 dark:text-gray-100",
              sizes[inputSize],
              iconPadding[inputSize],
              rightPadding[inputSize],
              !hasError && variants[variant],
              hasError &&
                "border border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/10",
              disabled &&
                "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800",
              className
            )}
            {...props}
          />

          {rightElement && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                rightPosition[inputSize],
                disabled && "opacity-60"
              )}
            >
              {rightElement}
            </div>
          )}
        </div>

        {(error || hint) && (
          <div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg
                  className="w-4 h-4 shrink-0"
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
              <p className="text-sm text-gray-600 dark:text-gray-400">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
