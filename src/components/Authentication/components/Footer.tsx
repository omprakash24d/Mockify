import React from "react";

export const Footer: React.FC = () => {
  return (
    <div className="text-center mt-8 space-y-3">
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        <span>© 2025 Mockify.</span>
        <span>•</span>
        <span>All rights reserved.</span>
        <span>•</span>
        <span>Trusted worldwide</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
        Secure authentication powered by industry-standard encryption. Your data
        is protected and never shared.
      </p>
    </div>
  );
};
