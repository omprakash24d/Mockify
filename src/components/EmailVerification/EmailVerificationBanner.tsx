/**
 * Email Verification Banner
 *
 * Shows a persistent banner when user's email is not verified
 */

import { sendEmailVerification } from "firebase/auth";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";

export const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dismissed, setDismissed] = useState(false);

  // Don't show banner if user doesn't exist, email is verified, or banner is dismissed
  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendEmailVerification(user);
      setSuccess("Verification email sent! Please check your inbox.");
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError((error as Error).message);
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">
                  Email verification required:
                </span>{" "}
                Please verify your email address to access all features.
              </p>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {success}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={loading}
              className="bg-white/50 dark:bg-gray-800/50 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
            >
              {loading ? "Sending..." : "Resend Email"}
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 p-1"
              aria-label="Dismiss"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
