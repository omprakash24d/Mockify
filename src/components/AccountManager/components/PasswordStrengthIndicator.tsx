import { cn } from "../../../lib/utils";
import type { PasswordStrength } from "../types";

interface PasswordStrengthIndicatorProps {
  password: string;
  passwordStrength: PasswordStrength;
}

export function PasswordStrengthIndicator({
  password,
  passwordStrength,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const getStrengthConfig = (score: number) => {
    if (score >= 4) {
      return {
        color: "bg-green-500",
        text: "text-green-600 dark:text-green-400",
        label: "Strong",
      };
    }
    if (score >= 3) {
      return {
        color: "bg-yellow-500",
        text: "text-yellow-600 dark:text-yellow-400",
        label: "Good",
      };
    }
    if (score >= 2) {
      return {
        color: "bg-orange-500",
        text: "text-orange-600 dark:text-orange-400",
        label: "Fair",
      };
    }
    return {
      color: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      label: "Weak",
    };
  };

  const config = getStrengthConfig(passwordStrength.score);
  const percentage = (passwordStrength.score / 4) * 100;

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500", config.color)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={cn("text-xs font-medium", config.text)}>
          {config.label}
        </span>
      </div>

      {/* Error Messages */}
      {passwordStrength.errors.length > 0 && (
        <ul className="space-y-1">
          {passwordStrength.errors.map((error, index) => (
            <li key={index} className={cn("text-xs", config.text)}>
              • {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
