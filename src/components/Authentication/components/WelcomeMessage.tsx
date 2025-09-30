import React from "react";

interface WelcomeMessageProps {
  isLogin: boolean;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isLogin }) => {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {isLogin ? "Welcome back!" : "Join Mockify"}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {isLogin
          ? "Sign in to access your dashboard"
          : "Create your account to get started"}
      </p>
    </div>
  );
};
