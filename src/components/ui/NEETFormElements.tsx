import React from "react";
import { cn } from "../../lib/utils";

interface NEETSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const NEETSelect: React.FC<NEETSelectProps> = ({
  label,
  error,
  success,
  fullWidth = false,
  options,
  placeholder,
  className,
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1", fullWidth && "w-full")}>
      {label && (
        <label htmlFor={selectId} className="label-neet">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "select-neet",
          error &&
            "border-neet-error-500 focus:border-neet-error-500 focus:ring-neet-error-500",
          success &&
            "border-neet-success-500 focus:border-neet-success-500 focus:ring-neet-success-500",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-neet-error-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-neet-success-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
};

interface NEETTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  fullWidth?: boolean;
  resize?: boolean;
}

export const NEETTextarea: React.FC<NEETTextareaProps> = ({
  label,
  error,
  success,
  fullWidth = false,
  resize = true,
  className,
  id,
  ...props
}) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1", fullWidth && "w-full")}>
      {label && (
        <label htmlFor={textareaId} className="label-neet">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "input-neet min-h-[80px]",
          !resize && "resize-none",
          error &&
            "border-neet-error-500 focus:border-neet-error-500 focus:ring-neet-error-500",
          success &&
            "border-neet-success-500 focus:border-neet-success-500 focus:ring-neet-success-500",
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-neet-error-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-neet-success-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
};
