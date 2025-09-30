import React from "react";

export const BackgroundPattern: React.FC = () => {
  return (
    <div className="absolute inset-0 opacity-20">
      <svg
        className="w-full h-full"
        viewBox="0 0 60 60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="7"
              cy="7"
              r="1"
              fill="currentColor"
              className="text-gray-300 dark:text-gray-700"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
};
