import { KeyRound, Lock, Shield } from "lucide-react";
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
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Security Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update your password to keep your account secure
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Current Password <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type={visibility.currentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                onPasswordChange("currentPassword", e.target.value)
              }
              className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter your current password"
              required
            />

            <PasswordToggle
              isVisible={visibility.currentPassword}
              onToggle={() => onVisibilityToggle("currentPassword")}
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Required for security verification
          </p>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            New Password <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type={visibility.newPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => onPasswordChange("newPassword", e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Create a strong new password"
              required
            />

            <PasswordToggle
              isVisible={visibility.newPassword}
              onToggle={() => onVisibilityToggle("newPassword")}
            />
          </div>

          {passwordData.newPassword && (
            <div className="mt-2">
              <PasswordStrengthIndicator
                password={passwordData.newPassword}
                passwordStrength={passwordStrength}
              />
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            At least 8 characters with uppercase, lowercase, numbers, and
            symbols
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Confirm New Password <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Lock
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                isPasswordMismatch ? "text-red-500" : "text-gray-400"
              )}
            />

            <input
              type={visibility.confirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                onPasswordChange("confirmPassword", e.target.value)
              }
              className={cn(
                "w-full pl-10 pr-12 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition",
                isPasswordMismatch
                  ? "border-red-300 dark:border-red-600 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              )}
              placeholder="Confirm your new password"
              required
            />

            <PasswordToggle
              isVisible={visibility.confirmPassword}
              onToggle={() => onVisibilityToggle("confirmPassword")}
            />
          </div>

          {isPasswordMismatch ? (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              Passwords do not match
            </p>
          ) : passwordData.confirmPassword && passwordData.newPassword ? (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              Passwords match
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Re-enter your new password to confirm
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500",
            loading || !isFormValid
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
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
        </button>

        {/* Security Tips */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Security Tips
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use a unique password you haven't used elsewhere</li>
            <li>• Consider using a password manager</li>
            <li>• Enable two-factor authentication when available</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
