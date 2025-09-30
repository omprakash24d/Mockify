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
  // Basic password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };

    Object.values(checks).forEach((check) => {
      if (check) score++;
    });

    return { score, checks };
  };

  const { score, checks } = calculateStrength(password);
  const passwordsMatch = confirmPassword ? password === confirmPassword : true;

  const getStrengthConfig = (strength: number) => {
    if (strength >= 4)
      return {
        label: "Strong",
        color: "bg-green-500",
        textColor: "text-green-600 dark:text-green-400",
        width: "w-full",
      };
    if (strength >= 3)
      return {
        label: "Good",
        color: "bg-yellow-500",
        textColor: "text-yellow-600 dark:text-yellow-400",
        width: "w-3/4",
      };
    if (strength >= 2)
      return {
        label: "Fair",
        color: "bg-orange-500",
        textColor: "text-orange-600 dark:text-orange-400",
        width: "w-1/2",
      };
    return {
      label: "Weak",
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      width: "w-1/4",
    };
  };

  const config = getStrengthConfig(score);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              config.color,
              config.width
            )}
          />
        </div>
        <span className={cn("text-sm font-medium", config.textColor)}>
          {config.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
        <div
          className={cn(
            "flex items-center gap-1",
            checks.length
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400"
          )}
        >
          <span>{checks.length ? "✓" : "○"}</span>
          <span>8+ characters</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1",
            checks.uppercase
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400"
          )}
        >
          <span>{checks.uppercase ? "✓" : "○"}</span>
          <span>Uppercase letter</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1",
            checks.lowercase
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400"
          )}
        >
          <span>{checks.lowercase ? "✓" : "○"}</span>
          <span>Lowercase letter</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1",
            checks.numbers
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400"
          )}
        >
          <span>{checks.numbers ? "✓" : "○"}</span>
          <span>Number</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1",
            checks.special
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400"
          )}
        >
          <span>{checks.special ? "✓" : "○"}</span>
          <span>Special character</span>
        </div>
        {showConfirmation && confirmPassword && (
          <div
            className={cn(
              "flex items-center gap-1",
              passwordsMatch
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            <span>{passwordsMatch ? "✓" : "✗"}</span>
            <span>Passwords match</span>
          </div>
        )}
      </div>
    </div>
  );
};
