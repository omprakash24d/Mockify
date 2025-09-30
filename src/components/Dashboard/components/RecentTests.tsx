import type { User } from "firebase/auth";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import React from "react";
import type { Test } from "../../../types/schema";
import { Button } from "../../ui/Button";
import { formatDate } from "../utils/dashboardUtils";

interface RecentTestsProps {
  user: User | null;
  recentTests: Test[];
}

export const RecentTests: React.FC<RecentTestsProps> = ({
  user,
  recentTests,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Recent Test Performance
        </h3>
      </div>

      {recentTests.length > 0 ? (
        <div className="space-y-3">
          {recentTests.map((test, index) => (
            <div
              key={test.id}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {test.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(test.created_at)} • {test.num_questions}{" "}
                      questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
                    {test.num_questions} Qs
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {user ? "Ready to get started?" : "Track your progress"}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {user
              ? "Create your first test to see your performance and track your learning journey"
              : "Sign in to track your test performance and monitor your progress over time"}
          </p>
          {user ? (
            <Button
              size="lg"
              onClick={() => (window.location.href = "/create-test")}
            >
              Create Your First Test
            </Button>
          ) : (
            <Button variant="outline" size="lg">
              Get Started
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
