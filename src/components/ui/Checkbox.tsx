import { Check } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  className,
  id,
  ...props
}) => {
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-start space-x-3">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            "h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors",
            "dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-400",
            "peer sr-only",
            className
          )}
          {...props}
        />
        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-checked:border-blue-600 dark:peer-checked:border-blue-500 transition-colors flex items-center justify-center">
          <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
