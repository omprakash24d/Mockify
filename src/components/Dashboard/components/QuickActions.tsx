import { BarChart3, BookOpen, PlayCircle, Plus, Zap } from "lucide-react";
import React from "react";
import type { QuickAction } from "../types";

export const QuickActions: React.FC = () => {
  const quickActions: QuickAction[] = [
    {
      title: "Create New Test",
      subtitle: "Start practicing now",
      icon: Plus,
      onClick: () => (window.location.href = "/create-test"),
      primary: true,
      bgColor: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      title: "Browse Subjects",
      subtitle: "Explore content",
      icon: BookOpen,
      onClick: () => {},
      bgColor:
        "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100",
    },
    {
      title: "View Analytics",
      subtitle: "Track progress",
      icon: BarChart3,
      onClick: () => {},
      bgColor:
        "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100",
    },
    {
      title: "Practice Mode",
      subtitle: "Quick questions",
      icon: PlayCircle,
      onClick: () => {},
      bgColor:
        "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100",
    },
  ];

  return (
    <div className="card-neet p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600">Jump right into your study session</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`h-32 ${
                action.primary ? "btn-neet-primary" : "btn-neet-secondary"
              } rounded-xl p-6 flex flex-col items-center justify-center gap-3 group transition-all duration-300 hover:scale-105 hover:shadow-lg border-0`}
            >
              <IconComponent className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-center">
                <span className="font-semibold text-lg block">
                  {action.title}
                </span>
                <span className="text-sm opacity-75">{action.subtitle}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
