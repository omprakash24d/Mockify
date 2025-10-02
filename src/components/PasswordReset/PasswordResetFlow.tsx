/**
 * Enhanced Password Reset Flow
 *
 * Provides secure password reset functionality with:
 * - Email verification
 * - Secure token validation
 * - Password strength validation
 * - Rate limiting protection
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthSecurityMiddleware from "../../middleware/authSecurity";
import { enhancedAuthService } from "../Authentication/utils/enhancedAuthService";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { PasswordStrengthIndicator } from "../ui/PasswordStrengthIndicator";

interface PasswordResetState {
  step: "request" | "confirm" | "success";
  loading: boolean;
  error: string;
  success: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
  actionCode: string;
}

export const PasswordResetFlow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const securityMiddleware = AuthSecurityMiddleware.getInstance();

  const [state, setState] = useState<PasswordResetState>({
    step: "request",
    loading: false,
    error: "",
    success: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
    actionCode: searchParams.get("oobCode") || "",
  });

  // If we have an action code, go directly to password reset confirmation
  useEffect(() => {
    if (state.actionCode) {
      setState((prev) => ({ ...prev, step: "confirm" }));
    }
  }, [state.actionCode]);

  // Password strength validation
  const passwordStrength = React.useMemo(() => {
    return enhancedAuthService.checkPasswordStrength(state.newPassword);
  }, [state.newPassword]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting
    if (!securityMiddleware.checkRateLimit(state.email, "reset")) {
      const remaining = securityMiddleware.getRateLimitRemaining(
        state.email,
        "reset"
      );
      const minutes = Math.ceil(remaining / 60000);
      setState((prev) => ({
        ...prev,
        error: `Too many reset attempts. Please try again in ${minutes} minutes.`,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      const result = await enhancedAuthService.sendPasswordReset(state.email);
      setState((prev) => ({
        ...prev,
        loading: false,
        success: result.message,
        step: "success",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.newPassword !== state.confirmPassword) {
      setState((prev) => ({ ...prev, error: "Passwords do not match" }));
      return;
    }

    if (!passwordStrength.isValid) {
      setState((prev) => ({
        ...prev,
        error:
          "Please choose a stronger password: " +
          passwordStrength.feedback.join(", "),
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const result = await enhancedAuthService.confirmPasswordReset(
        state.actionCode,
        state.newPassword
      );

      setState((prev) => ({
        ...prev,
        loading: false,
        success: result.message,
        step: "success",
      }));

      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/?reset=success");
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  };

  const renderRequestForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={state.email}
              onChange={(e) =>
                setState((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter your email address"
              required
              disabled={state.loading}
            />
          </div>

          {state.error && <Alert variant="destructive">{state.error}</Alert>}

          <Button
            type="submit"
            className="w-full"
            disabled={state.loading || !state.email}
          >
            {state.loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Button type="button" variant="ghost" onClick={() => navigate("/")}>
              Back to Sign In
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );

  const renderConfirmForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set New Password
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleConfirmReset} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              value={state.newPassword}
              onChange={(e) =>
                setState((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              placeholder="Enter new password"
              required
              disabled={state.loading}
            />
            {state.newPassword && (
              <PasswordStrengthIndicator password={state.newPassword} />
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={state.confirmPassword}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm new password"
              required
              disabled={state.loading}
            />
          </div>

          {state.error && <Alert variant="destructive">{state.error}</Alert>}

          <Button
            type="submit"
            className="w-full"
            disabled={
              state.loading ||
              !state.newPassword ||
              !state.confirmPassword ||
              !passwordStrength.isValid
            }
          >
            {state.loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6 text-center">
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
          {state.step === "success" && state.actionCode
            ? "Password Updated!"
            : "Reset Link Sent!"}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{state.success}</p>

        {state.step === "success" && state.actionCode && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Redirecting to sign in page...
          </p>
        )}

        <Button onClick={() => navigate("/")} className="w-full">
          {state.step === "success" && state.actionCode
            ? "Go to Sign In"
            : "Back to Sign In"}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {state.step === "request" && renderRequestForm()}
        {state.step === "confirm" && renderConfirmForm()}
        {state.step === "success" && renderSuccess()}
      </div>
    </div>
  );
};

export default PasswordResetFlow;
