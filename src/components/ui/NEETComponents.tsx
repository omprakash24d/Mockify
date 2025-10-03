import React from "react";

interface NEETUIWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const NEETUIWrapper: React.FC<NEETUIWrapperProps> = ({
  children,
  className = "",
}) => {
  return <div className={`neet-prep-font ${className}`}>{children}</div>;
};

// Export commonly used NEET-style components for consistency
export const NEETCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => (
  <div
    className={`card-neet ${className}`}
    onClick={onClick}
    role={onClick ? "button" : "article"}
    tabIndex={onClick ? 0 : undefined}
  >
    {children}
  </div>
);

export const NEETButton: React.FC<{
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
}) => {
  const baseClass =
    variant === "primary" ? "btn-neet-primary" : "btn-neet-secondary";
  const sizeClass = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }[size];

  return (
    <button
      type={type}
      className={`${baseClass} ${sizeClass} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const NEETInput: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  name?: string;
}> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
  error = false,
  id,
  name,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`input-neet ${error ? "border-red-500" : ""} ${className}`}
    disabled={disabled}
    id={id}
    name={name}
  />
);

export const NEETSelect: React.FC<{
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  name?: string;
}> = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  error = false,
  id,
  name,
}) => (
  <select
    value={value}
    onChange={onChange}
    className={`select-neet ${error ? "border-red-500" : ""} ${className}`}
    disabled={disabled}
    id={id}
    name={name}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export const NEETTextarea: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  rows?: number;
  id?: string;
  name?: string;
}> = ({
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
  error = false,
  rows = 4,
  id,
  name,
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    className={`textarea-neet ${error ? "border-red-500" : ""} ${className}`}
    disabled={disabled}
    id={id}
    name={name}
  />
);

export const NEETLabel: React.FC<{
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}> = ({ children, htmlFor, className = "", required = false }) => (
  <label htmlFor={htmlFor} className={`label-neet ${className}`}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export const NEETBadge: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}> = ({ children, variant = "default", className = "" }) => (
  <span
    className={`badge-neet ${
      variant !== "default" ? variant : ""
    } ${className}`}
  >
    {children}
  </span>
);

export const NEETPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-blue-100">{subtitle}</p>}
        </div>
        {children && <div className="hidden lg:block">{children}</div>}
      </div>
    </div>
  </div>
);

export const NEETContainer: React.FC<{
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl";
  className?: string;
}> = ({ children, maxWidth = "7xl", className = "" }) => {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
  }[maxWidth];

  return (
    <div
      className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
};
