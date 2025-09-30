/**
 * Authentication Messages Component
 *
 * This file consolidates all message-related components used in authentication flows.
 * Includes error, success, completion hints, and form dividers for a clean and modern interface.
 *
 * Features:
 * - Error messages with animated appearance
 * - Success messages with confirmation
 * - Form completion hints with progress indicators
 * - Elegant form dividers
 * - Consistent theming and accessibility
 */

import { AlertCircle, CheckCircle } from "lucide-react";
import React from "react";
import type { AuthFormData, PasswordStrength } from "../types";
import { getFormCompletionHints } from "../utils";

/* ============================================================================
 * ERROR MESSAGE COMPONENT
 * ============================================================================ */
interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg animate-slide-down">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Authentication Error
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * SUCCESS MESSAGE COMPONENT
 * ============================================================================ */
interface SuccessMessageProps {
  show: boolean;
  title: string;
  message: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  show,
  title,
  message,
}) => {
  if (!show) return null;

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg animate-slide-down">
      <div className="flex items-start space-x-3">
        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            {title}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * FORM DIVIDER COMPONENT
 * ============================================================================ */
export const FormDivider: React.FC = () => {
  return (
    <div className="my-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/95 dark:bg-gray-900/95 text-gray-500 dark:text-gray-400 font-medium backdrop-blur-sm">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * FORM COMPLETION HINT COMPONENT
 * ============================================================================ */
interface FormCompletionHintProps {
  isLogin: boolean;
  isFormValid: boolean;
  formData: AuthFormData;
  passwordStrength: PasswordStrength;
}

export const FormCompletionHint: React.FC<FormCompletionHintProps> = ({
  isLogin,
  isFormValid,
  formData,
  passwordStrength,
}) => {
  if (isLogin || isFormValid) return null;

  const hints = getFormCompletionHints(formData, passwordStrength);

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-2">Complete all required fields:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
            {hints.map((hint, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span
                  className={`w-1 h-1 rounded-full ${
                    hint === "Strong password" || hint === "Passwords match"
                      ? "bg-yellow-400"
                      : hint === "Passwords match"
                      ? "bg-red-400"
                      : "bg-blue-400"
                  }`}
                ></span>
                <span>{hint}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
