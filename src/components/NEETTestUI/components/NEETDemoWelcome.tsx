import React from "react";
import { Button } from "../../ui/Button";

export const NEETDemoWelcome: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to NEET Test Portal</h1>
        <p className="text-xl mb-8 text-blue-100">
          Practice with authentic NEET questions and boost your preparation
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-white text-blue-600 hover:bg-gray-100">
            Start Test
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-600"
          >
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};
