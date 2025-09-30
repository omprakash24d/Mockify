import { CheckCircle } from "lucide-react";
import React from "react";

export const BrandHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center mb-6">
        {/* Modern Logo */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-lg flex items-center justify-center transform rotate-2 hover:rotate-0 transition-transform duration-300">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* Brand Text */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent leading-tight">
          Mockify
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          Test Preparation Platform
        </p>
      </div>
    </div>
  );
};
