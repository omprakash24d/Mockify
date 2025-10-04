import { BookOpen, Brain, Target, Trophy } from "lucide-react";
import React from "react";
import type { DashboardStats, StatCard } from "../types";

interface StatisticsCardsProps {
  stats: DashboardStats;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
  const statCards: StatCard[] = [
    {
      title: "Subjects",
      value: stats.totalSubjects,
      subtitle: "Available for practice",
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Chapters",
      value: stats.totalChapters,
      subtitle: "Organized content",
      icon: Target,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Questions",
      value: stats.totalQuestions,
      subtitle: "Ready to solve",
      icon: Brain,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Your Tests",
      value: stats.totalTests,
      subtitle: "Tests completed",
      icon: Trophy,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 group animate-fade-in-up"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <IconComponent className={`w-4 h-4 ${card.color}`} />
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {card.title}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {card.subtitle}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
              >
                <IconComponent className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
