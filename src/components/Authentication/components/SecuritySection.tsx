import { Eye, EyeOff, Lock } from "lucide-react";
import React from "react";
import { Input } from "../../ui/Input";
import { PasswordStrengthIndicator } from "../../ui/PasswordStrengthIndicator";
import type { AuthFormData, FormFieldHandlers } from "../types";

interface SecuritySectionProps {
  formData: AuthFormData;
  formFieldHandlers: FormFieldHandlers;
  validationErrors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  passwordRef: React.RefObject<HTMLInputElement | null>;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  formData,
  formFieldHandlers,
  validationErrors,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  passwordRef,
}) => {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-2">
          <Lock className="w-3 h-3 text-red-600 dark:text-red-400" />
        </div>
        Security Setup
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          ref={passwordRef}
          id="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          required
          value={formData.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            formFieldHandlers.setPassword(e.target.value)
          }
          placeholder="Create a strong password"
          icon={<Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
          error={validationErrors.password}
          variant="filled"
          inputSize="md"
          rightElement={
            <button
              type="button"
              onClick={onTogglePassword}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />

        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          required
          value={formData.confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            formFieldHandlers.setConfirmPassword(e.target.value)
          }
          placeholder="Confirm your password"
          icon={<Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
          error={validationErrors.confirmPassword}
          variant="filled"
          inputSize="md"
          rightElement={
            <button
              type="button"
              onClick={onToggleConfirmPassword}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />
      </div>
      <div className="mt-4">
        <PasswordStrengthIndicator
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          showConfirmation={!!formData.confirmPassword}
        />
      </div>
    </div>
  );
};
