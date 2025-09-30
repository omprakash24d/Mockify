import { Check, X } from "lucide-react";
import React from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  showConfirmation?: boolean;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
}

const passwordCriteria: PasswordCriteria[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, confirmPassword, showConfirmation = false }) => {
  const getPasswordScore = () => {
    return passwordCriteria.reduce((score, criterion) => {
      return score + (criterion.test(password) ? 1 : 0);
    }, 0);
  };

  const getStrengthData = (score: number) => {
    if (score === 0)
      return {
        color: "bg-gray-300 dark:bg-gray-600",
        text: "Enter password",
        textColor: "text-gray-500",
      };
    if (score <= 2)
      return {
        color: "bg-red-500",
        text: "Weak",
        textColor: "text-red-500",
      };
    if (score <= 3)
      return {
        color: "bg-yellow-500",
        text: "Fair",
        textColor: "text-yellow-500",
      };
    if (score <= 4)
      return { color: "bg-blue-500", text: "Good", textColor: "text-blue-500" };
    return {
      color: "bg-green-500",
      text: "Strong",
      textColor: "text-green-500",
    };
  };

  const score = getPasswordScore();
  const strengthData = getStrengthData(score);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  if (!password) return null;

  return (
    <div className="mt-4 p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 ${strengthData.color.replace(
              "bg-",
              "bg-"
            )}/20 rounded-lg flex items-center justify-center`}
          >
            <div className={`w-4 h-4 ${strengthData.color} rounded-full`}></div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password Security
          </span>
        </div>
        <span className={`text-sm font-semibold ${strengthData.textColor}`}>
          {strengthData.text}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-2 ${strengthData.color} transition-all duration-500 ease-out`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400 dark:text-gray-500">
          <span>Weak</span>
          <span>Strong</span>
        </div>
      </div>

      {/* Criteria Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {passwordCriteria.map((criterion, index) => {
          const isValid = criterion.test(password);
          return (
            <div key={index} className="flex items-center space-x-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isValid
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {isValid ? (
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isValid
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {criterion.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Password Match Indicator */}
      {showConfirmation && confirmPassword !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                passwordsMatch
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              {passwordsMatch ? (
                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <X className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                passwordsMatch
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {passwordsMatch ? "Passwords match" : "Passwords don't match"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
