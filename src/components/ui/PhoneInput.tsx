import { Phone } from "lucide-react";
import React from "react";

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
      ...props
    },
    ref
  ) => {
    const inputId = id || `phone-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const phoneNumber = e.target.value.replace(/\D/g, ""); // Remove non-digits
      if (phoneNumber.length <= 10) {
        onChange?.(phoneNumber);
      }
    };

    const formatDisplayValue = (phoneNumber: string) => {
      if (!phoneNumber) return "";
      if (phoneNumber.length <= 5) return phoneNumber;
      if (phoneNumber.length <= 10) {
        return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
      }
      return phoneNumber;
    };

    return (
      <div className="space-y-2">
        {/* Label - consistent with Input component */}
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium font-inter ${
            error
              ? "text-red-600 dark:text-red-400"
              : "text-gray-700 dark:text-gray-300"
          } ${disabled ? "opacity-60" : ""}`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Input Container */}
        <div className="relative">
          {/* Country Code Prefix */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center text-gray-500 dark:text-gray-400 z-10">
            <Phone className="h-5 w-5 mr-2" />
            <span className="text-base font-medium mr-3">+91</span>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mr-3" />
          </div>

          {/* Phone Input Field - consistent with Input component styling */}
          <input
            ref={ref}
            id={inputId}
            type="tel"
            value={formatDisplayValue(value || "")}
            onChange={handleChange}
            placeholder="Enter 10-digit number"
            disabled={disabled}
            className={`
              w-full pl-28 pr-4 py-3 text-base font-inter rounded-xl transition-all duration-200 ease-out
              focus:outline-none focus:ring-3 focus:ring-opacity-20
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              text-gray-900 dark:text-gray-100
              min-h-[44px]
              ${
                !error
                  ? "bg-gray-100 border border-transparent dark:bg-gray-800 dark:border-transparent focus:bg-white focus:border-gray-300 dark:focus:bg-gray-900 dark:focus:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  : "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500/20"
              }
              ${
                disabled
                  ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  : ""
              }
              ${className || ""}
            `}
            {...props}
          />
        </div>

        {/* Error Message - consistent with Input component */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
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
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
