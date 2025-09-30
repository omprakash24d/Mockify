import { BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Question } from "../../types/neet";

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

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(elapsed);
      if (onTimeUpdate) {
        onTimeUpdate(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUpdate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {question.subjectName} • {question.chapterName}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>{formatTime(timeSpent)}</span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.questionText}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = selectedAnswer === option.text;
          const isCorrect = option.isCorrect;

          let optionClasses =
            "w-full text-left p-4 rounded-lg border transition-all duration-200 ";

          if (showResult) {
            if (isCorrect) {
              optionClasses += "bg-green-50 border-green-300 text-green-800 ";
            } else if (isSelected && !isCorrect) {
              optionClasses += "bg-red-50 border-red-300 text-red-800 ";
            } else {
              optionClasses += "bg-gray-50 border-gray-200 text-gray-600 ";
            }
          } else {
            if (isSelected) {
              optionClasses += "bg-blue-50 border-blue-300 text-blue-800 ";
            } else {
              optionClasses +=
                "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 ";
            }
          }

          return (
            <button
              key={index}
              className={optionClasses}
              onClick={() => !showResult && onAnswerSelect(option.text)}
              disabled={showResult}
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-sm bg-white rounded-full w-6 h-6 flex items-center justify-center border">
                  {optionLabel}
                </span>
                <span className="flex-1 text-left">{option.text}</span>
                {showResult && isCorrect && (
                  <CheckCircle size={20} className="text-green-600" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle size={20} className="text-red-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Statistics */}
      {question.statistics && (
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BarChart3 size={16} />
              <span>Statistics:</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>
                Attempts:{" "}
                <span className="font-medium">
                  {question.statistics.totalAttempts}
                </span>
              </span>
              <span>
                Success Rate:
                <span
                  className={`font-medium ml-1 ${getSuccessRateColor(
                    question.successRate
                  )}`}
                >
                  {question.successRate}%
                </span>
              </span>
              {question.statistics.averageTimeSpent > 0 && (
                <span>
                  Avg Time:{" "}
                  <span className="font-medium">
                    {Math.round(question.statistics.averageTimeSpent)}s
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtopic Tags */}
      {question.subtopicTags && question.subtopicTags.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {question.subtopicTags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
