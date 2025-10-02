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
    <div className="flex items-start gap-3">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn("peer sr-only", className)}
          {...props}
        />
        <div className="w-4 h-4 rounded border border-gray-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-800 dark:peer-checked:bg-blue-500 transition-colors flex items-center justify-center cursor-pointer">
          <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
