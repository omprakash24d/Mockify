import type { User } from "firebase/auth";
import { BookOpen } from "lucide-react";
import React from "react";
import type { DashboardStats } from "../types";

interface DashboardHeroProps {
  user: User | null;
  stats: DashboardStats;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  user,
  stats,
}) => {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6">
        <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Welcome to Mockify
      </h1>

      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
        {user ? (
          <>
            Hello{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {user.displayName || user.email?.split("@")[0]}
            </span>
            ! Ready to excel in your studies?
          </>
        ) : (
          "Your comprehensive test preparation platform"
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.totalQuestions}
            </span>{" "}
            Questions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.totalSubjects}
            </span>{" "}
            Subjects
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.totalChapters}
            </span>{" "}
            Chapters
          </span>
        </div>
      </div>
    </div>
  );
};
