import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getQuestions, getSubjects } from "../services/firestore";
import { MockifyAPI } from "../services/mockifyAPI";
import type { Test } from "../types/schema";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface DashboardStats {
  totalSubjects: number;
  totalChapters: number;
  totalQuestions: number;
  totalTests: number;
  recentActivity: string[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalChapters: 0,
    totalQuestions: 0,
    totalTests: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentTests, setRecentTests] = useState<Test[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the firestore wrapper functions for better compatibility
      const subjects = await getSubjects();

      // Load sample questions to get count
      const sampleQuestions = await getQuestions({
        subjects: [],
        chapters: [],
        difficulty: ["easy", "medium", "hard"],
        questionCount: 1000,
        onlyPYQs: false,
        includeImages: true,
      });

      // Calculate chapters from subjects
      let totalChapters = 0;
      for (const subject of subjects) {
        try {
          const chapters = await MockifyAPI.getChaptersBySubject(subject.id);
          totalChapters += chapters.length;
        } catch (err) {
          console.warn(
            `Could not load chapters for subject ${subject.id}:`,
            err
          );
        }
      }

      // Load user's recent tests if authenticated
      let userTests: Test[] = [];
      if (user) {
        try {
          userTests = await MockifyAPI.getUserTests(user.uid);
        } catch (error) {
          console.log("No user tests found yet:", error);
        }
      }

      setStats({
        totalSubjects: subjects.length,
        totalChapters,
        totalQuestions: sampleQuestions.length,
        totalTests: userTests.length,
        recentActivity: [
          `${subjects.length} subjects available for study`,
          `${totalChapters} chapters organized by topics`,
          `${sampleQuestions.length} practice questions ready`,
          "Smart PDF generation with answer keys",
          "Progress tracking and analytics",
          "Multi-device responsive design",
        ],
      });

      setRecentTests(userTests.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        {/* Loading Header */}
        <div className="mb-8">
          <div className="loading-skeleton h-8 rounded-2xl w-64 mb-3"></div>
          <div className="loading-skeleton h-4 rounded-xl w-96"></div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <div className="space-y-3">
                <div className="loading-skeleton h-4 rounded-xl w-3/4"></div>
                <div className="loading-skeleton h-8 rounded-xl w-1/2"></div>
                <div className="loading-skeleton h-3 rounded-lg w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Loading Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <div className="space-y-4">
                <div className="loading-skeleton h-5 rounded-xl w-48"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-3">
                      <div className="loading-skeleton w-2 h-2 rounded-full"></div>
                      <div className="loading-skeleton h-3 rounded-lg flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <Card
          variant="elevated"
          padding="xl"
          className="text-center max-w-md mx-auto"
        >
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Welcome back!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {error}
          </p>
          <Button onClick={loadDashboardData} size="lg" fullWidth>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 bg-clip-text text-transparent mb-4">
          Welcome to Mockify! 🎓
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
          {user
            ? `Hello ${user.displayName || user.email?.split("@")[0]}!`
            : "Your comprehensive test preparation platform"}{" "}
          Ready to practice with{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {stats.totalQuestions} questions
          </span>{" "}
          across{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {stats.totalSubjects} subjects
          </span>
          .
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card variant="elevated" padding="lg" interactive className="group">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Subjects
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stats.totalSubjects}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Available for practice
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-200">
              <div className="text-2xl">📚</div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg" interactive className="group">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Chapters
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {stats.totalChapters}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Organized content
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-200">
              <div className="text-2xl">📖</div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg" interactive className="group">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Practice Questions
              </h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                {stats.totalQuestions}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Ready to solve
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 group-hover:scale-110 transition-transform duration-200">
              <div className="text-2xl">🧠</div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg" interactive className="group">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Your Tests
              </h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {stats.totalTests}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Completed so far
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-200">
              <div className="text-2xl">🎯</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <Card variant="elevated" padding="lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              🚀
            </div>
            Platform Features
          </h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {activity}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              📊
            </div>
            Recent Test Performance
          </h2>
          {recentTests.length > 0 ? (
            <div className="space-y-3">
              {recentTests.map((test) => (
                <Card
                  key={test.id}
                  variant="ghost"
                  padding="sm"
                  interactive
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {test.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(test.created_at)} • {test.num_questions}{" "}
                        questions
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {test.num_questions} Qs
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {user ? "No tests taken yet" : "Track your progress"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                {user
                  ? "Create your first test to see your performance here"
                  : "Sign in to track your test performance and progress"}
              </p>
              {!user && (
                <Button variant="outline" size="md">
                  Get Started
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
            ⚡
          </div>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            size="xl"
            className="h-24 flex flex-col items-center justify-center gap-3 group"
            onClick={() => (window.location.href = "/create-test")}
          >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
              🧪
            </div>
            <span className="font-semibold">Create New Test</span>
          </Button>

          <Button
            variant="outline"
            size="xl"
            className="h-24 flex flex-col items-center justify-center gap-3 group"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
              📚
            </div>
            <span className="font-semibold">Browse Subjects</span>
          </Button>

          <Button
            variant="outline"
            size="xl"
            className="h-24 flex flex-col items-center justify-center gap-3 group"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
              📊
            </div>
            <span className="font-semibold">View Analytics</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
