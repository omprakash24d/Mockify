import { AlertTriangle, Bookmark, FileText, Share2, Video } from "lucide-react";
import React, { useState } from "react";
import type { Question as DatabaseQuestion } from "../../../types/neet";
import { ReportQuestionModal } from "../../ui/ReportQuestionModal";
import type { Question } from "../types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Level 1":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
      case "Level 2":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30";
      case "Level 3":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30";
      case "Level 4":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800";
    }
  };

  const getDifficultyLabel = (difficulty: string, percentage: number) => {
    const ranges: Record<string, string> = {
      "Level 1": "80%+",
      "Level 2": "60%+",
      "Level 3": "35%-60%",
      "Level 4": "Below 35%",
    };
    return `${percentage}% ${difficulty}: ${ranges[difficulty] || ""}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-sm dark:hover:shadow-lg transition-shadow">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            Q{questionNumber}:
          </span>
          {/* Question Text */}
          <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-line">
            {question.text}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
          <button className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedOption === index
                ? selectedOption === question.correctAnswer
                  ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                  : "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            }`}
          >
            <span className="font-medium mr-3">({index + 1})</span>
            {option}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center space-x-2">
          {question.subtopic && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Subtopic: {question.subtopic} |
            </span>
          )}
          <span
            className={`text-sm px-2 py-1 rounded ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            {getDifficultyLabel(
              question.difficulty,
              question.percentageCorrect
            )}
          </span>
        </div>
        {question.videoAvailable && (
          <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            <Video className="w-4 h-4" />
            <span>Show me in Video</span>
          </button>
        )}

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <FileText className="w-4 h-4" />
          <span>View Explanation</span>
        </button>

        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
          Add Note
        </button>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Explanation (if shown) */}
      {showExplanation && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Explanation:
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            The correct answer is option {question.correctAnswer + 1}. This
            question tests your understanding of {question.topic.toLowerCase()}.
          </p>
        </div>
      )}

      {/* Report Question Modal */}
      <ReportQuestionModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        question={
          {
            _id: question.id,
            questionText: question.text,
            options: question.options.map((opt, idx) => ({
              text: opt,
              isCorrect: idx === question.correctAnswer,
            })),
            correctAnswer: question.options[question.correctAnswer],
            subjectName: question.subject,
            chapterName: question.topic,
          } as DatabaseQuestion
        }
      />
    </div>
  );
};
