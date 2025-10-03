import { Bookmark, FileText, Share2, Video } from "lucide-react";
import React, { useState } from "react";
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

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Level 1":
        return "text-green-600 bg-green-50";
      case "Level 2":
        return "text-blue-600 bg-blue-50";
      case "Level 3":
        return "text-orange-600 bg-orange-50";
      case "Level 4":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
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
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-blue-600 font-semibold">
            Q{questionNumber}:
          </span>
          {/* Question Text */}
          <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
            {question.text}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? "text-blue-600 bg-blue-50"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
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
                  ? "border-green-300 bg-green-50 text-green-800"
                  : "border-red-300 bg-red-50 text-red-800"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
            <span className="text-sm text-gray-600">
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
          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
            <Video className="w-4 h-4" />
            <span>Show me in Video</span>
          </button>
        )}

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
        >
          <FileText className="w-4 h-4" />
          <span>View Explanation</span>
        </button>

        <button className="text-blue-600 hover:text-blue-700">Add Note</button>
      </div>

      {/* Explanation (if shown) */}
      {showExplanation && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-semibold text-gray-800 mb-2">Explanation:</h4>
          <p className="text-gray-700">
            The correct answer is option {question.correctAnswer + 1}. This
            question tests your understanding of {question.topic.toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
};
