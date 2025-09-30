import { KeyRound, Lock, Shield, ShieldCheck } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { cn } from "../../../lib/utils";
import type {
  PasswordFormData,
  PasswordStrength,
  VisibilityStates,
} from "../types";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { PasswordToggle } from "./PasswordToggle";

interface PasswordFormProps {
  passwordData: PasswordFormData;
  passwordStrength: PasswordStrength;
  visibility: VisibilityStates;
  loading: boolean;
  onPasswordChange: (field: keyof PasswordFormData, value: string) => void;
  onVisibilityToggle: (field: keyof VisibilityStates) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PasswordForm({
  passwordData,
  passwordStrength,
  visibility,
  loading,
  onPasswordChange,
  onVisibilityToggle,
  onSubmit,
}: PasswordFormProps) {
  const { classes } = useTheme();

  const isPasswordMismatch =
    passwordData.confirmPassword &&
    passwordData.newPassword &&
    passwordData.confirmPassword !== passwordData.newPassword;

  const isFormValid =
    passwordData.currentPassword &&
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    passwordStrength.isValid &&
    !isPasswordMismatch;

  return (
    <div
      role="tabpanel"
      id="password-panel"
      aria-labelledby="password-tab"
      className="p-6 sm:p-8 space-y-8"
    >
      {/* Header section */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
          {/* Decorative elements */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-300" />
        </div>

        <div className="space-y-1">
          <h3 className={`text-lg font-semibold ${classes.text.primary}`}>
            Security Settings
          </h3>
          <p className={`text-sm ${classes.text.secondary}`}>
            Update your password to keep your account secure
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Current Password */}
        <div className="space-y-3">
          <label
            className={`block text-sm font-semibold ${classes.text.primary}`}
          >
            Current Password
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200">
              <KeyRound className="h-5 w-5" />
            </div>

            <input
              type={visibility.currentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                onPasswordChange("currentPassword", e.target.value)
              }
              className={cn(
                `w-full pl-12 pr-14 py-4 rounded-2xl border-2 transition-all duration-200
                 text-sm font-medium placeholder-gray-400
                 focus:outline-none focus:ring-4 focus:ring-red-500/20`,
                classes.bg.elevated,
                classes.text.primary,
                `${classes.border.default} focus:border-red-500 dark:focus:border-red-400
                 hover:border-gray-300 dark:hover:border-gray-600`
              )}
              placeholder="Enter your current password"
              required
              aria-describedby="current-password-help"
            />

            <PasswordToggle
              isVisible={visibility.currentPassword}
              onToggle={() => onVisibilityToggle("currentPassword")}
            />
          </div>

          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-3 h-3" />
            <p id="current-password-help" className="text-xs">
              Required for security verification
            </p>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-3">
          <label
            className={`block text-sm font-semibold ${classes.text.primary}`}
          >
            New Password
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
              <Lock className="h-5 w-5" />
            </div>

            <input
              type={visibility.newPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => onPasswordChange("newPassword", e.target.value)}
              className={cn(
                `w-full pl-12 pr-14 py-4 rounded-2xl border-2 transition-all duration-200
                 text-sm font-medium placeholder-gray-400
                 focus:outline-none focus:ring-4 focus:ring-blue-500/20`,
                classes.bg.elevated,
                classes.text.primary,
                `${classes.border.default} focus:border-blue-500 dark:focus:border-blue-400
                 hover:border-gray-300 dark:hover:border-gray-600`
              )}
              placeholder="Create a strong new password"
              required
              aria-describedby="new-password-help"
            />

            <PasswordToggle
              isVisible={visibility.newPassword}
              onToggle={() => onVisibilityToggle("newPassword")}
            />
          </div>

          {/* Enhanced Password Strength Indicator */}
          {passwordData.newPassword && (
            <div className="mt-3">
              <PasswordStrengthIndicator
                password={passwordData.newPassword}
                passwordStrength={passwordStrength}
              />
            </div>
          )}

          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Shield className="w-3 h-3" />
            <p id="new-password-help" className="text-xs">
              At least 8 characters with uppercase, lowercase, numbers, and
              symbols
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-3">
          <label
            className={`block text-sm font-semibold ${classes.text.primary}`}
          >
            Confirm New Password
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="relative group">
            <div
              className={`
              absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200
              ${
                isPasswordMismatch
                  ? "text-red-500"
                  : "text-gray-400 group-focus-within:text-green-500"
              }
            `}
            >
              <Lock className="h-5 w-5" />
            </div>

            <input
              type={visibility.confirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                onPasswordChange("confirmPassword", e.target.value)
              }
              className={cn(
                `w-full pl-12 pr-14 py-4 rounded-2xl border-2 transition-all duration-200
                 text-sm font-medium placeholder-gray-400
                 focus:outline-none focus:ring-4`,
                classes.bg.elevated,
                classes.text.primary,
                isPasswordMismatch
                  ? `border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400
                     focus:ring-red-500/20 bg-red-50/50 dark:bg-red-900/10`
                  : `${classes.border.default} focus:border-green-500 dark:focus:border-green-400
                     focus:ring-green-500/20 hover:border-gray-300 dark:hover:border-gray-600`
              )}
              placeholder="Confirm your new password"
              required
              aria-describedby="confirm-password-help"
            />

            <PasswordToggle
              isVisible={visibility.confirmPassword}
              onToggle={() => onVisibilityToggle("confirmPassword")}
            />
          </div>

          {isPasswordMismatch ? (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <div className="w-1 h-1 bg-red-500 rounded-full" />
              <p className="text-xs font-medium">Passwords do not match</p>
            </div>
          ) : passwordData.confirmPassword &&
            passwordData.newPassword &&
            !isPasswordMismatch ? (
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <ShieldCheck className="w-3 h-3" />
              <p className="text-xs font-medium">Passwords match perfectly</p>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Shield className="w-3 h-3" />
              <p id="confirm-password-help" className="text-xs">
                Re-enter your new password to confirm
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={cn(
              `w-full flex items-center justify-center py-4 px-6 rounded-2xl
               text-sm font-bold transition-all duration-200 transform
               focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:ring-offset-2
               dark:focus:ring-offset-gray-800 relative overflow-hidden group`,
              loading || !isFormValid
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : `bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700
                   text-white hover:scale-[1.02] active:scale-[0.98] 
                   shadow-lg hover:shadow-xl`
            )}
          >
            {/* Button background gradient */}
            {!loading && isFormValid && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            {/* Button content */}
            <div className="relative flex items-center space-x-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </div>

            {/* Security badge */}
            {!loading && isFormValid && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Security tips */}
        <div
          className={`p-4 rounded-2xl ${classes.bg.accent} border ${classes.border.light}`}
        >
          <div className="flex items-start space-x-3">
            <ShieldCheck className={`w-5 h-5 mt-0.5 ${classes.text.accent}`} />
            <div className="space-y-2">
              <h4 className={`text-sm font-semibold ${classes.text.primary}`}>
                Security Tips
              </h4>
              <ul className={`text-xs ${classes.text.secondary} space-y-1`}>
                <li>• Use a unique password you haven't used elsewhere</li>
                <li>• Consider using a password manager</li>
                <li>• Enable two-factor authentication when available</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
