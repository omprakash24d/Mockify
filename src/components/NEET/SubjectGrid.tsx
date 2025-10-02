import { BookOpen, TrendingUp, Users } from "lucide-react";
import React from "react";
import type { Subject, SubjectProgress } from "../../types/neet";

interface ProgressData {
  [subjectName: string]: SubjectProgress;
}

interface SubjectCardProps {
  subject: Subject;
  onClick?: (subject: Subject) => void;
  progress?: SubjectProgress | null;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onClick,
  progress = null,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(subject);
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getSubjectColors = () => {
    const colorMap: {
      [key: string]: { bg: string; icon: string; border: string };
    } = {
      Physics: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        icon: "text-blue-600 dark:text-blue-400",
        border: "border-l-blue-500",
      },
      Chemistry: {
        bg: "bg-green-100 dark:bg-green-900/30",
        icon: "text-green-600 dark:text-green-400",
        border: "border-l-green-500",
      },
      Biology: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        icon: "text-purple-600 dark:text-purple-400",
        border: "border-l-purple-500",
      },
      Botany: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        icon: "text-emerald-600 dark:text-emerald-400",
        border: "border-l-emerald-500",
      },
      Zoology: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        icon: "text-amber-600 dark:text-amber-400",
        border: "border-l-amber-500",
      },
    };
    return colorMap[subject.displayName] || colorMap.Physics;
  };

  const colors = getSubjectColors();

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${colors.border} border-l-4 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105 group`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}
          >
            <span className={colors.icon}>{subject.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {subject.displayName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subject.description || `Master ${subject.displayName} concepts`}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${colors.bg} rounded-lg`}>
            <BookOpen size={18} className={colors.icon} />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {subject.statistics?.totalQuestions || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Questions
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`p-2 ${colors.bg} rounded-lg`}>
            <Users size={18} className={colors.icon} />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {subject.statistics?.totalChapters || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Chapters
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar (if progress data is available) */}
      {progress && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {progress.overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                progress.overallProgress
              )}`}
              style={{ width: `${progress.overallProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{progress.overallStats.attemptedQuestions} attempted</span>
            <span>{progress.overallStats.totalQuestions} total</span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <TrendingUp size={16} className={colors.icon} />
          <span className="font-medium">Performance</span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          {progress ? (
            <>
              <span className="text-gray-600 dark:text-gray-400">
                Success:{" "}
                <span className="font-bold text-green-600 dark:text-green-400">
                  {Math.round(
                    progress.chapterProgress.reduce(
                      (acc, ch) => acc + ch.successRate,
                      0
                    ) / progress.chapterProgress.length || 0
                  )}
                  %
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Avg Time:{" "}
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(
                    progress.chapterProgress.reduce(
                      (acc, ch) => acc + ch.avgTimeSpent,
                      0
                    ) / progress.chapterProgress.length || 0
                  )}
                  s
                </span>
              </span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Click to start practicing
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface SubjectGridProps {
  subjects: Subject[];
  onSubjectClick?: (subject: Subject) => void;
  progressData?: ProgressData;
}

const SubjectGrid: React.FC<SubjectGridProps> = ({
  subjects,
  onSubjectClick,
  progressData = {},
}) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <BookOpen
          size={64}
          className="mx-auto text-gray-400 dark:text-gray-500 mb-6"
        />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          No subjects available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Subjects will appear here once the data is loaded. Please refresh the
          page if this persists.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.name}
          subject={subject}
          onClick={onSubjectClick}
          progress={progressData[subject.name]}
        />
      ))}
    </div>
  );
};

export default SubjectGrid;
export { SubjectCard };
