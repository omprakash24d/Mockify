import React from "react";

interface WelcomeMessageProps {
  isLogin: boolean;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isLogin }) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center space-y-3 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
        {isLogin ? "Welcome back!" : "Join Mockify"}
      </h2>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
        {isLogin
          ? "Sign in to access your dashboard and continue learning."
          : "Create your account to unlock personalized test prep features."}
      </p>
    </div>
  );
};
