import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import type { Question } from "../../types/neet";
import { ReportQuestionModal } from "../ui/ReportQuestionModal";

interface QuestionCardProps {
  question: Question;
  onAnswerSelect: (answer: string) => void;
  selectedAnswer: string | null;
  showResult?: boolean;
  onTimeUpdate?: (timeSpent: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswerSelect,
  selectedAnswer,
  showResult = false,
  onTimeUpdate = null,
}) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(elapsed);
      onTimeUpdate?.(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUpdate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case "medium":
        return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20";
      case "hard":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 70) return "text-green-600 dark:text-green-400";
    if (rate >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            {question.subjectName} • {question.chapterName}
          </span>
          <span
            className={cn(
              "px-2.5 py-1 rounded text-xs font-semibold",
              getDifficultyColor(question.difficulty)
            )}
          >
            {question.difficulty?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 px-2.5 py-1 bg-gray-50 dark:bg-gray-700 rounded">
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeSpent)}</span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {question.questionText}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isSelected = selectedAnswer === option.text;

          // Debug logging to understand the data structure (temporary)
          if (index === 0) {
            console.log("QuestionCard Debug - FIXED LOGIC:", {
              questionId: question._id,
              correctAnswer: question.correctAnswer,
              correctAnswerType: typeof question.correctAnswer,
              options: question.options.map((opt, idx) => ({
                index: idx,
                letter: String.fromCharCode(65 + idx),
                text: opt.text,
                isCorrect: opt.isCorrect,
                newLogicResult:
                  opt.isCorrect || question.correctAnswer === opt.text,
                comparisonCorrectAnswerVsText:
                  question.correctAnswer === opt.text,
              })),
            });
          }

          // Correct logic: correctAnswer is the text of the correct option (virtual field)
          const isCorrect =
            option.isCorrect || question.correctAnswer === option.text;

          return (
            <button
              key={index}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition",
                showResult
                  ? isCorrect
                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300"
                    : isSelected
                    ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                  : isSelected
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-300"
                  : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
              onClick={() => !showResult && onAnswerSelect(option.text)}
              disabled={showResult}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm bg-white dark:bg-gray-800 rounded-full w-7 h-7 flex items-center justify-center border border-gray-300 dark:border-gray-600 flex-shrink-0">
                  {optionLabel}
                </span>
                <span className="flex-1">{option.text}</span>
                {showResult && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Statistics */}
      {question.statistics && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-sm">Statistics</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-400">
                    Attempts:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {question.statistics.totalAttempts}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-400">
                    Success:
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      getSuccessRateColor(question.successRate)
                    )}
                  >
                    {question.successRate}%
                  </span>
                </div>
                {question.statistics.averageTimeSpent > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Avg:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {Math.round(question.statistics.averageTimeSpent)}s
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtopic Tags */}
      {question.subtopicTags && question.subtopicTags.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            Topics:
          </span>
          <div className="flex flex-wrap gap-2">
            {question.subtopicTags.map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Report Question Modal */}
      <ReportQuestionModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        question={question}
      />
    </div>
  );
};

export default QuestionCard;
