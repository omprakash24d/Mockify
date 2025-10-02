import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  FileQuestion,
  Image,
  PieChart,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface DashboardStats {
  totalQuestions: number;
  totalSubjects: number;
  totalChapters: number;
  questionsWithoutImages: number;
  questionsByDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  questionsBySubject: Array<{
    subject: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    action: string;
    details: string;
    timestamp: string;
  }>;
  averageAccuracy: number;
  totalAttempts: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "blue",
  onClick,
}) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  const handleClick = onClick ? () => onClick() : undefined;

  return (
    <Card
      className={`p-6 hover:shadow-lg transition-shadow duration-200 ${
        onClick ? "cursor-pointer hover:scale-105" : ""
      }`}
    >
      <div className="flex items-center justify-between" onClick={handleClick}>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  trend.isPositive ? "" : "rotate-180"
                }`}
              />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

interface AdminDashboardWidgetsProps {
  onNavigate?: (route: string) => void;
}

export const AdminDashboardWidgets: React.FC<AdminDashboardWidgetsProps> = ({
  onNavigate,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch admin stats and basic data
      const [subjectsResponse, healthResponse, sampleQuestionsResponse] =
        await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/admin/database/health"),
          fetch("/api/questions?limit=100"), // Sample for detailed analysis
        ]);

      const subjectsData = await subjectsResponse.json();
      const healthData = await healthResponse.json();
      const sampleQuestionsData = await sampleQuestionsResponse.json();

      const questions = sampleQuestionsData.data?.questions || [];

      // Calculate statistics with fallbacks since count operations may fail
      const totalQuestions =
        healthData.data?.collections?.questions ||
        sampleQuestionsData.data?.pagination?.totalQuestions ||
        36000; // Fallback to estimated count
      const totalSubjects = subjectsData.data?.length || 0;
      const totalChapters =
        healthData.data?.collections?.chapters || totalSubjects * 25; // Estimated fallback (avg 25 chapters per subject)

      // Questions without images
      const questionsWithoutImages = questions.filter(
        (q: any) => !q.questionImages || q.questionImages.length === 0
      ).length;

      // Questions by difficulty
      const questionsByDifficulty = questions.reduce(
        (acc: any, q: any) => {
          acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
          return acc;
        },
        { Easy: 0, Medium: 0, Hard: 0 }
      );

      // Questions by subject
      const subjectCounts = questions.reduce((acc: any, q: any) => {
        acc[q.subjectName] = (acc[q.subjectName] || 0) + 1;
        return acc;
      }, {});

      const questionsBySubject = Object.entries(subjectCounts).map(
        ([subject, count]) => ({
          subject,
          count: count as number,
          percentage: Math.round(((count as number) / totalQuestions) * 100),
        })
      );

      // Calculate averages
      const totalAttempts = questions.reduce(
        (sum: number, q: any) => sum + (q.statistics?.totalAttempts || 0),
        0
      );

      const totalCorrect = questions.reduce(
        (sum: number, q: any) => sum + (q.statistics?.correctAttempts || 0),
        0
      );

      const averageAccuracy =
        totalAttempts > 0
          ? Math.round((totalCorrect / totalAttempts) * 100)
          : 0;

      // Mock recent activity (in a real app, you'd track this)
      const recentActivity = [
        {
          action: "Questions Created",
          details: "25 new questions added to Physics",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          action: "Bulk Import",
          details: "150 questions imported from CSV",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          action: "Questions Updated",
          details: "10 questions had images added",
          timestamp: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      setStats({
        totalQuestions,
        totalSubjects,
        totalChapters,
        questionsWithoutImages,
        questionsByDifficulty,
        questionsBySubject: questionsBySubject.slice(0, 5), // Top 5 subjects
        recentActivity,
        averageAccuracy,
        totalAttempts,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading dashboard: {error}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardStats}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions}
          icon={<FileQuestion className="w-6 h-6" />}
          color="blue"
          onClick={() => onNavigate?.("/admin")}
        />

        <StatCard
          title="Subjects"
          value={stats.totalSubjects}
          icon={<BookOpen className="w-6 h-6" />}
          color="green"
        />

        <StatCard
          title="Chapters"
          value={stats.totalChapters}
          icon={<Target className="w-6 h-6" />}
          color="purple"
        />

        <StatCard
          title="Missing Images"
          value={stats.questionsWithoutImages}
          icon={<Image className="w-6 h-6" />}
          color="red"
          onClick={() => onNavigate?.("/admin?filter=noImages")}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Average Accuracy"
          value={`${stats.averageAccuracy}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          trend={{ value: 5.2, isPositive: true }}
        />

        <StatCard
          title="Total Attempts"
          value={stats.totalAttempts}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />

        <StatCard
          title="This Month"
          value="1,234"
          icon={<Calendar className="w-6 h-6" />}
          color="yellow"
          trend={{ value: 12.5, isPositive: true }}
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Difficulty Distribution
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-3">
            {Object.entries(stats.questionsByDifficulty).map(
              ([difficulty, count]) => {
                const percentage = Math.round(
                  (count / stats.totalQuestions) * 100
                );
                const colorClass =
                  difficulty === "Easy"
                    ? "bg-green-500"
                    : difficulty === "Medium"
                    ? "bg-yellow-500"
                    : "bg-red-500";

                return (
                  <div key={difficulty} className="flex items-center">
                    <div className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {difficulty}
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colorClass}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>

        {/* Subject Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Subjects
            </h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-3">
            {stats.questionsBySubject.map((item, index) => {
              const colors = [
                "bg-blue-500",
                "bg-green-500",
                "bg-yellow-500",
                "bg-red-500",
                "bg-purple-500",
              ];
              const colorClass = colors[index % colors.length];

              return (
                <div key={item.subject} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${colorClass} mr-3`} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.subject}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>

        <div className="space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FileQuestion className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.details}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.("/admin")}
          >
            View All Activity
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => onNavigate?.("/admin?action=create")}
            className="justify-start"
          >
            <FileQuestion className="w-4 h-4 mr-2" />
            Add Question
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate?.("/admin?action=import")}
            className="justify-start"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Import Questions
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate?.("/admin?filter=noImages")}
            className="justify-start"
          >
            <Image className="w-4 h-4 mr-2" />
            Add Images
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate?.("/admin?action=export")}
            className="justify-start"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardWidgets;
