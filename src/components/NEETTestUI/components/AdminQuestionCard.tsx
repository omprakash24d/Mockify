import {
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit,
  Eye,
  Trash2,
  Users,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import type { Question } from "../../../types/neet";
import { Button } from "../../ui/Button";

interface AdminQuestionCardProps {
  question: Question;
  questionNumber: number;
  isSelected: boolean;
  onSelect: (questionId: string, selected: boolean) => void;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (question: Question) => void;
  onViewDetails: (question: Question) => void;
}

export const AdminQuestionCard: React.FC<AdminQuestionCardProps> = ({
  question,
  questionNumber,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
      case "medium":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      case "hard":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800";
    }
  };

  const getSuccessRate = useCallback(() => {
    if (question.statistics.totalAttempts === 0) return 0;
    return Math.round(
      (question.statistics.correctAttempts /
        question.statistics.totalAttempts) *
        100
    );
  }, [question.statistics]);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (rate >= 60) return "text-amber-600 dark:text-amber-400";
    if (rate >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete this question?\n\n"${question.questionText.substring(
          0,
          100
        )}..."`
      )
    ) {
      onDelete(question._id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const successRate = getSuccessRate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(question._id, e.target.checked)}
            className="mt-1.5 w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
          />

          <div className="flex-1 space-y-4">
            {/* Question Header Info */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex items-center text-sm font-medium">
                <span className="text-blue-600 dark:text-blue-400 mr-2">
                  Q{questionNumber}:
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {question.subjectName}
                </span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {question.chapterName}
                </span>
                {question.yearAppeared && (
                  <>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {question.yearAppeared}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${getDifficultyColor(
                    question.difficulty
                  )}`}
                >
                  {question.difficulty.toUpperCase()}
                </span>
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800">
                  {successRate}% accuracy
                </span>
                {question.subtopicTags && question.subtopicTags.length > 0 && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs">
                    {question.subtopicTags.length} tags
                  </span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                {isExpanded
                  ? question.questionText
                  : `${question.questionText.substring(0, 200)}${
                      question.questionText.length > 200 ? "..." : ""
                    }`}
              </p>
              {question.questionText.length > 200 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Options Section (Expandable) */}
            <div className="space-y-3">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                {showOptions ? "Hide Options" : "Show Options"}
                {showOptions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showOptions && (
                <div className="space-y-2 pl-6">
                  {question.options.map((option, index) => {
                    const optionLabel = String.fromCharCode(65 + index);

                    // Debug logging for admin view
                    if (index === 0) {
                      console.log("AdminQuestionCard Debug:", {
                        questionId: question._id,
                        correctAnswer: question.correctAnswer,
                        correctAnswerType: typeof question.correctAnswer,
                        options: question.options.map((opt, idx) => ({
                          index: idx,
                          letter: String.fromCharCode(65 + idx),
                          text: opt.text,
                          isCorrect: opt.isCorrect,
                          isCorrectType: typeof opt.isCorrect,
                        })),
                      });
                    }

                    // Correct logic: correctAnswer is the text of the correct option (virtual field)
                    const isCorrectOption =
                      option.isCorrect ||
                      question.correctAnswer === option.text;

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border transition-colors ${
                          isCorrectOption
                            ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700"
                            : "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-medium text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            ({optionLabel})
                          </span>
                          <span
                            className={`flex-1 text-sm ${
                              isCorrectOption
                                ? "text-emerald-800 dark:text-emerald-200 font-medium"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {option.text}
                          </span>
                          {isCorrectOption && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {question.statistics.totalAttempts}
                </span>
                <span>attempts</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span
                  className={`font-medium ${getSuccessRateColor(successRate)}`}
                >
                  {question.statistics.correctAttempts}
                </span>
                <span>correct</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {Math.round(question.statistics.averageTimeSpent)}s
                </span>
                <span>avg time</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span
                  className={`font-medium ${getSuccessRateColor(successRate)}`}
                >
                  {successRate}%
                </span>
                <span>success rate</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Created: {formatDate(question.createdAt)}</span>
              <span>Updated: {formatDate(question.updatedAt)}</span>
              <span>Question #{questionNumber}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                size="sm"
                variant="outline"
                className="shadow-sm font-medium rounded-xl"
                onClick={() => onViewDetails(question)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="shadow-sm font-medium rounded-xl"
                onClick={() => onEdit(question)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="shadow-sm font-medium rounded-xl"
                onClick={() => onDuplicate(question)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 shadow-sm font-medium rounded-xl"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
