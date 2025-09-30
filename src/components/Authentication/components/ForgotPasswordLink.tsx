import React from "react";

interface ForgotPasswordLinkProps {
  email: string;
  loading: boolean;
  resetLoading: boolean;
  onPasswordReset: () => void;
}

export const ForgotPasswordLink: React.FC<ForgotPasswordLinkProps> = ({
  email,
  loading,
  resetLoading,
  onPasswordReset,
}) => {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onPasswordReset}
        disabled={!email || loading || resetLoading}
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send password reset email"
      >
        {resetLoading ? "Sending..." : "Forgot password?"}
      </button>
    </div>
  );
};
