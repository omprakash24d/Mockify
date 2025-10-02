/**
 * Email Verification Guide Component
 *
 * Provides clear guidance to users about email verification during signup/login
 */

import { CheckCircle, Mail } from "lucide-react";
import React from "react";
import { Button } from "../../ui/Button";

interface EmailVerificationGuideProps {
  isSignup: boolean;
  email: string;
  onResendVerification?: () => void;
  resendLoading?: boolean;
  showInline?: boolean;
}

export const EmailVerificationGuide: React.FC<EmailVerificationGuideProps> = ({
  isSignup,
  email,
  onResendVerification,
  resendLoading = false,
  showInline = false,
}) => {
  const containerClass = showInline
    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4"
    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg";

  return (
    <div className={containerClass}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isSignup
              ? "Verify Your Email Address"
              : "Email Verification Required"}
          </h3>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>
              {isSignup
                ? `We've sent a verification email to ${email}. Please check your inbox and click the verification link to activate your account.`
                : `Your email address ${email} needs to be verified to access all features.`}
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                What to do next:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return to this page and refresh or sign in again</li>
                {!isSignup && (
                  <li>You can continue using the app with limited features</li>
                )}
              </ol>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              {onResendVerification && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResendVerification}
                  disabled={resendLoading}
                  className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  {resendLoading ? "Sending..." : "Resend Email"}
                </Button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Didn't receive the email? Check your spam folder or contact
                support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
