import React from "react";
import { cn } from "../../lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  showConfirmation?: boolean;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, confirmPassword, showConfirmation = false }) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const passwordsMatch = confirmPassword ? password === confirmPassword : true;

  const getStrength = () => {
    if (score >= 4)
      return {
        label: "Strong",
        color: "bg-green-500",
        text: "text-green-600 dark:text-green-400",
        width: "w-full",
      };
    if (score >= 3)
      return {
        label: "Good",
        color: "bg-yellow-500",
        text: "text-yellow-600 dark:text-yellow-400",
        width: "w-3/4",
      };
    if (score >= 2)
      return {
        label: "Fair",
        color: "bg-orange-500",
        text: "text-orange-600 dark:text-orange-400",
        width: "w-1/2",
      };
    return {
      label: "Weak",
      color: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      width: "w-1/4",
    };
  };

  if (!password) return null;

  const strength = getStrength();

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              strength.color,
              strength.width
            )}
          />
        </div>
        <span className={cn("text-sm font-medium", strength.text)}>
          {strength.label}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
        <CheckItem met={checks.length}>8+ characters</CheckItem>
        <CheckItem met={checks.uppercase}>Uppercase letter</CheckItem>
        <CheckItem met={checks.lowercase}>Lowercase letter</CheckItem>
        <CheckItem met={checks.numbers}>Number</CheckItem>
        <CheckItem met={checks.special}>Special character</CheckItem>
        {showConfirmation && confirmPassword && (
          <CheckItem met={passwordsMatch} isMatch>
            Passwords match
          </CheckItem>
        )}
      </div>
    </div>
  );
};

interface CheckItemProps {
  met: boolean;
  children: React.ReactNode;
  isMatch?: boolean;
}

const CheckItem: React.FC<CheckItemProps> = ({
  met,
  children,
  isMatch = false,
}) => (
  <div
    className={cn(
      "flex items-center gap-1",
      met
        ? "text-green-600 dark:text-green-400"
        : isMatch
        ? "text-red-600 dark:text-red-400"
        : "text-gray-400"
    )}
  >
    <span>{met ? "✓" : isMatch ? "✗" : "○"}</span>
    <span>{children}</span>
  </div>
);
