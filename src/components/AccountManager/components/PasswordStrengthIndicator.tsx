import { AlertTriangle, CheckCircle, Shield, Zap } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { PasswordStrength } from "../types";
import { PASSWORD_STRENGTH_MAX_SCORE } from "../utils/constants";

interface PasswordStrengthIndicatorProps {
  password: string;
  passwordStrength: PasswordStrength;
}

export function PasswordStrengthIndicator({
  password,
  passwordStrength,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strengthLevel =
    passwordStrength.score >= PASSWORD_STRENGTH_MAX_SCORE
      ? "excellent"
      : passwordStrength.score >= 3
      ? "good"
      : passwordStrength.score >= 2
      ? "fair"
      : "weak";

  const strengthConfig = {
    weak: {
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      icon: AlertTriangle,
      label: "Weak",
      description: "Password needs improvement",
    },
    fair: {
      color: "bg-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      icon: Zap,
      label: "Fair",
      description: "Getting better, add more complexity",
    },
    good: {
      color: "bg-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      icon: Shield,
      label: "Good",
      description: "Strong password, almost there",
    },
    excellent: {
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      icon: CheckCircle,
      label: "Excellent",
      description: "Very secure password!",
    },
  };

  const config = strengthConfig[strengthLevel];
  const Icon = config.icon;
  const progressPercentage =
    (passwordStrength.score / PASSWORD_STRENGTH_MAX_SCORE) * 100;

  return (
    <div className="space-y-3">
      {/* Main strength indicator */}
      <div
        className={`p-4 rounded-2xl border ${config.borderColor} ${config.bgColor} transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-4 h-4 ${config.textColor}`} />
            </div>
            <div>
              <span className={`text-sm font-semibold ${config.textColor}`}>
                {config.label}
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {config.description}
              </p>
            </div>
          </div>
          <div
            className={`text-xs font-bold ${config.textColor} bg-white dark:bg-gray-800 px-2 py-1 rounded-full`}
          >
            {Math.round(progressPercentage)}%
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="relative">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out relative",
                config.color
              )}
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Shimmer effect for excellent passwords */}
              {strengthLevel === "excellent" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              )}
            </div>
          </div>

          {/* Progress markers */}
          <div className="absolute top-0 left-0 w-full h-3 flex justify-between items-center px-1">
            {[1, 2, 3, 4].map((marker) => (
              <div
                key={marker}
                className={cn(
                  "w-1 h-1 rounded-full transition-all duration-300",
                  passwordStrength.score >= marker
                    ? "bg-white shadow-sm"
                    : "bg-gray-400 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Error messages with improved styling */}
      {passwordStrength.errors.length > 0 && (
        <div className="space-y-2">
          {passwordStrength.errors.slice(0, 3).map((error, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 text-xs ${config.textColor} animate-slide-down`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${config.color} mt-1.5 flex-shrink-0`}
              />
              <span className="leading-relaxed">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Completion checklist for excellent passwords */}
      {strengthLevel === "excellent" && (
        <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span className="font-medium">All security requirements met!</span>
        </div>
      )}
    </div>
  );
}
