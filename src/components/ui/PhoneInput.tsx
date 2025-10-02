import { Phone } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label = "Phone Number",
      error,
      value,
      onChange,
      className,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `phone-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const phoneNumber = e.target.value.replace(/\D/g, "");
      if (phoneNumber.length <= 10) {
        onChange?.(phoneNumber);
      }
    };

    const formatDisplayValue = (phoneNumber: string) => {
      if (!phoneNumber) return "";
      if (phoneNumber.length <= 5) return phoneNumber;
      return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5, 10)}`;
    };

    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className={cn(
            "block text-sm font-medium",
            error
              ? "text-red-600 dark:text-red-400"
              : "text-gray-700 dark:text-gray-300",
            disabled && "opacity-60"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          {/* Country Code Prefix */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-600 dark:text-gray-400 pointer-events-none">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">+91</span>
            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          </div>

          <input
            ref={ref}
            id={inputId}
            type="tel"
            value={formatDisplayValue(value || "")}
            onChange={handleChange}
            placeholder="Enter 10-digit number"
            disabled={disabled}
            maxLength={11}
            className={cn(
              "w-full pl-24 pr-4 py-2.5 text-base rounded-lg transition",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "placeholder:text-gray-400 text-gray-900 dark:text-gray-100",
              !error &&
                "bg-gray-50 border border-gray-300 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500",
              error &&
                "border border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/10",
              disabled &&
                "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800",
              className
            )}
            {...props}
          />
        </div>

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
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
