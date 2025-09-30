import { Lock, User } from "lucide-react";
import React from "react";

interface FormHeaderProps {
  isLogin: boolean;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ isLogin }) => {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3">
        {isLogin ? (
          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {isLogin ? "Sign in to your account" : "Create your account"}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {isLogin
          ? "Enter your credentials to access your dashboard"
          : "Fill in your details to get started"}
      </p>
    </div>
  );
};
