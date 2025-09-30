import React from "react";

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

export const AuthToggle: React.FC<AuthToggleProps> = ({
  isLogin,
  onToggle,
}) => {
  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={onToggle}
        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors group"
      >
        <span className="group-hover:underline decoration-2 underline-offset-2">
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </span>
      </button>
    </div>
  );
};
