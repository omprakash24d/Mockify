/**
 * Email Verification Flow Component
 *
 * Handles email verification for new users and provides
 * resend functionality with rate limiting
 */

import { sendEmailVerification } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthSecurityMiddleware from "../../middleware/authSecurity";
import { enhancedAuthService } from "../Authentication/utils/enhancedAuthService";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface EmailVerificationState {
  loading: boolean;
  error: string;
  success: string;
  resendCooldown: number;
  verificationSent: boolean;
}

export const EmailVerificationFlow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const securityMiddleware = AuthSecurityMiddleware.getInstance();

  const [state, setState] = useState<EmailVerificationState>({
    loading: false,
    error: "",
    success: "",
    resendCooldown: 0,
    verificationSent: false,
  });

  const actionCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  // Handle email verification on component mount
  useEffect(() => {
    if (mode === "verifyEmail" && actionCode) {
      handleEmailVerification(actionCode);
    }
  }, [mode, actionCode]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (state.resendCooldown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          resendCooldown: prev.resendCooldown - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.resendCooldown]);

  const handleEmailVerification = async (code: string) => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const success = await enhancedAuthService.verifyEmail(code);
      if (success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          success:
            "Email verified successfully! You can now access all features.",
        }));

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard?verified=true");
        }, 3000);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  };

  const handleResendVerification = async () => {
    if (!user || state.resendCooldown > 0) return;

    // Check rate limiting
    if (!securityMiddleware.checkRateLimit(user.email || "unknown", "reset")) {
      const remaining = securityMiddleware.getRateLimitRemaining(
        user.email || "unknown",
        "reset"
      );
      const minutes = Math.ceil(remaining / 60000);
      setState((prev) => ({
        ...prev,
        error: `Too many verification emails sent. Please try again in ${minutes} minutes.`,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      await sendEmailVerification(user);
      setState((prev) => ({
        ...prev,
        loading: false,
        success: "Verification email sent! Please check your inbox.",
        verificationSent: true,
        resendCooldown: 60, // 60 second cooldown
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // If verifying with action code
  if (mode === "verifyEmail" && actionCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <div className="p-6 text-center">
            {state.loading ? (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Verifying Email
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we verify your email address...
                </p>
              </div>
            ) : state.success ? (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Verified!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {state.success}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Redirecting to dashboard...
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
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
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Verification Failed
                </h1>
                <Alert variant="destructive" className="mb-6">
                  {state.error}
                </Alert>
                <div className="space-y-3">
                  <Button onClick={() => navigate("/")} className="w-full">
                    Back to Sign In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // If user needs to verify their email
  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verify Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                We've sent a verification email to:
              </p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {user.email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Please check your email
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Click the verification link in your email to activate your
                  account and access all features.
                </p>
              </div>

              {state.error && (
                <Alert variant="destructive">{state.error}</Alert>
              )}

              {state.success && (
                <Alert variant="success">{state.success}</Alert>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={state.loading || state.resendCooldown > 0}
                  className="w-full"
                  variant="outline"
                >
                  {state.loading
                    ? "Sending..."
                    : state.resendCooldown > 0
                    ? `Resend in ${state.resendCooldown}s`
                    : "Resend Verification Email"}
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  I've Verified My Email
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full text-gray-600 dark:text-gray-400"
                >
                  Sign Out and Use Different Account
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Check your spam folder if you don't see the email. The
                verification link expires in 24 hours.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // If user is verified or not logged in, redirect
  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (user.emailVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return null;
};

export default EmailVerificationFlow;
