import { Phone } from "lucide-react";
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, value, onChange, className, id, ...props }, ref) => {
    const inputId = id || `phone-${Math.random().toString(36).substr(2, 9)}`;
    const { theme } = useTheme();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const phoneNumber = e.target.value.replace(/\D/g, ""); // Remove non-digits
      if (phoneNumber.length <= 10) {
        onChange?.(phoneNumber);
      }
    };

    const themeClasses =
      theme === "dark"
        ? `
          bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400
          focus:border-blue-400 focus:ring-blue-400 focus:bg-gray-600
          hover:border-gray-500 hover:bg-gray-650
        `
        : `
          bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500
          focus:border-blue-500 focus:ring-blue-500 focus:bg-white
          hover:border-gray-400
        `;

    const errorClasses = error
      ? theme === "dark"
        ? "border-red-400 focus:border-red-400 focus:ring-red-400"
        : "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "";

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium font-lato ${
              error
                ? theme === "dark"
                  ? "text-red-400"
                  : "text-red-500"
                : theme === "dark"
                ? "text-gray-300"
                : "text-gray-700"
            }`}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Country Code Prefix with proper spacing */}
          <div
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium mr-3">+91</span>
            {/* Vertical divider */}
            <div
              className={`w-px h-6 mr-3 ${
                theme === "dark" ? "bg-gray-600" : "bg-gray-300"
              }`}
            />
          </div>

          {/* Phone Input Field with adjusted padding */}
          <input
            ref={ref}
            id={inputId}
            type="tel"
            value={value || ""}
            onChange={handleChange}
            placeholder="Enter 10-digit number"
            maxLength={10}
            className={`w-full pl-32 pr-4 py-3 font-lato text-base border rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses} ${errorClasses} ${
              className || ""
            }`}
            {...props}
          />
        </div>

        {/* Helper Text */}
        <div
          className={`text-xs ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Enter your 10-digit mobile number (without +91)
        </div>

        {/* Error Message */}
        {error && (
          <p
            className={`text-sm font-lato ${
              theme === "dark" ? "text-red-400" : "text-red-500"
            }`}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
