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

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
      onClick={handleClick}
      style={{ borderLeftColor: subject.color, borderLeftWidth: "4px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              backgroundColor: `${subject.color}20`,
              color: subject.color,
            }}
          >
            {subject.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {subject.displayName}
            </h3>
            <p className="text-sm text-gray-600">
              {subject.description || `Master ${subject.displayName} concepts`}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen size={16} className="text-gray-500" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {subject.statistics?.totalQuestions || 0}
            </div>
            <div className="text-xs text-gray-600">Questions</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Users size={16} className="text-gray-500" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {subject.statistics?.totalChapters || 0}
            </div>
            <div className="text-xs text-gray-600">Chapters</div>
          </div>
        </div>
      </div>

      {/* Progress Bar (if progress data is available) */}
      {progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">
              {progress.overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                progress.overallProgress
              )}`}
              style={{ width: `${progress.overallProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{progress.overallStats.attemptedQuestions} attempted</span>
            <span>{progress.overallStats.totalQuestions} total</span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <TrendingUp size={12} />
          <span>Performance</span>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          {progress && (
            <>
              <span className="text-gray-600">
                Success:{" "}
                <span className="font-medium text-green-600">
                  {Math.round(
                    progress.chapterProgress.reduce(
                      (acc, ch) => acc + ch.successRate,
                      0
                    ) / progress.chapterProgress.length || 0
                  )}
                  %
                </span>
              </span>
              <span className="text-gray-600">
                Avg Time:{" "}
                <span className="font-medium">
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
      <div className="text-center py-12">
        <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No subjects available
        </h3>
        <p className="text-gray-600">
          Subjects will appear here once the data is loaded.
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
