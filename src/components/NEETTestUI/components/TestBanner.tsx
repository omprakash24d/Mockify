import React from "react";

export const TestBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              NEET Classroom Test Series
            </h2>
            <p className="text-blue-100 dark:text-blue-200 mb-4">
              Join the biggest Classroom Test Series for NEET. Available across
              250+ centres across India.
            </p>
            <div className="flex space-x-4">
              <button className="bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors">
                Know More!!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
