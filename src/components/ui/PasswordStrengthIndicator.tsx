import { Check, X } from "lucide-react";
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

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
  const { theme } = useTheme();

  const getPasswordScore = () => {
    return passwordCriteria.reduce((score, criterion) => {
      return score + (criterion.test(password) ? 1 : 0);
    }, 0);
  };

  const getStrengthColor = (score: number) => {
    if (score === 0) return theme === "dark" ? "bg-gray-600" : "bg-gray-300";
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter password";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  };

  const score = getPasswordScore();
  const strengthColor = getStrengthColor(score);
  const strengthText = getStrengthText(score);
  const passwordsMatch = confirmPassword === password;

  if (!password) return null;

  return (
    <div
      className={`mt-3 p-4 rounded-lg border ${
        theme === "dark"
          ? "bg-gray-800 border-gray-600"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Password Strength
          </span>
          <span
            className={`text-sm font-medium ${
              score <= 2
                ? "text-red-500"
                : score <= 3
                ? "text-yellow-500"
                : score <= 4
                ? "text-blue-500"
                : "text-green-500"
            }`}
          >
            {strengthText}
          </span>
        </div>

        <div
          className={`w-full h-2 rounded-full ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Password Criteria */}
      <div className="space-y-2">
        {passwordCriteria.map((criterion, index) => {
          const isValid = criterion.test(password);
          return (
            <div key={index} className="flex items-center space-x-2">
              {isValid ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm ${
                  isValid
                    ? "text-green-500"
                    : theme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                {criterion.label}
              </span>
            </div>
          );
        })}

        {/* Password Match Indicator */}
        {showConfirmation && confirmPassword && (
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            {passwordsMatch ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`text-sm ${
                passwordsMatch ? "text-green-500" : "text-red-500"
              }`}
            >
              {passwordsMatch ? "Passwords match" : "Passwords don't match"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
