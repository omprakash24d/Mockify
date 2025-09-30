import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  RefreshCw,
  Settings,
} from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import type { StepComponentProps } from "../types";
import { calculateTotalMarks } from "../utils/helpers";

export const PreviewGenerateStep: React.FC<StepComponentProps> = ({
  state,
  actions,
}) => {
  const {
    questions,
    subjects,
    chapters,
    selectedSubjects,
    selectedChapters,
    testFilters,
    testTitle,
    loading,
  } = state;
  const { loadQuestions, generatePDF, generateAnswerKey } = actions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Eye className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
          Preview & Generate Test
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
          Review your test configuration and generate PDF files when ready.
        </p>
      </div>

      {/* Load Questions CTA */}
      {questions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
            Ready to Generate Questions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto transition-colors duration-300">
            Click the button below to generate questions based on your selected
            criteria. This may take a few moments.
          </p>
          <button
            onClick={loadQuestions}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 mr-2 inline" />
            Generate Questions
          </button>
        </div>
      )}

      {/* Test Summary - Always show */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 lg:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
              Test Configuration Summary
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Your test is configured with the following parameters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Title
              </span>
            </div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate transition-colors duration-300">
              {testTitle || "Untitled Test"}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Subjects
              </span>
            </div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
              {selectedSubjects.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate transition-colors duration-300">
              {selectedSubjects
                .map((id) => subjects.find((s) => s.id === id)?.name)
                .join(", ")}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Chapters
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {selectedChapters.length}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Target Questions
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {testFilters.questionCount}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Settings className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Difficulty
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {testFilters.difficulty.map((diff) => (
                <span
                  key={diff}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    diff === "easy" &&
                      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
                    diff === "medium" &&
                      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
                    diff === "hard" &&
                      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  )}
                >
                  {diff}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Generated Questions
              </span>
            </div>
            <div
              className={`text-2xl font-bold transition-colors duration-300 ${
                questions.length > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {questions.length > 0 ? questions.length : "Not loaded"}
            </div>
            {questions.length > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Total Marks: {calculateTotalMarks(questions)}
              </div>
            )}
          </div>
        </div>

        {/* Additional Options Summary */}
        <div className="mt-6 flex flex-wrap gap-3">
          {testFilters.includeImages && (
            <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Image Questions Included
              </span>
            </div>
          )}
          {testFilters.onlyPYQs && (
            <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-lg">
              <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Previous Year Questions Only
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Questions Preview */}
      {questions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    Questions Preview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Showing {Math.min(5, questions.length)} of{" "}
                    {questions.length} questions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {questions.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Total Questions
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {questions.slice(0, 5).map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      Q{index + 1}.
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          question.difficulty === "easy"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : question.difficulty === "medium"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        )}
                      >
                        {question.difficulty}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full bg-white dark:bg-gray-800 transition-colors duration-300">
                        {question.marks || 1} marks
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100 mb-3 leading-relaxed transition-colors duration-300">
                    {question.question_text.length > 200
                      ? `${question.question_text.substring(0, 200)}...`
                      : question.question_text}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-2 transition-colors duration-300">
                    <GraduationCap className="w-3 h-3" />
                    <span>
                      {chapters.find((c) => c.id === question.chapter_id)
                        ?.chapter_name || "Unknown Chapter"}
                    </span>
                  </div>
                </div>
              ))}

              {questions.length > 5 && (
                <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
                    ... and {questions.length - 5} more questions
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                    Total marks: {calculateTotalMarks(questions)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {questions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={generatePDF}
            disabled={loading}
            className={cn(
              "group relative overflow-hidden flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl",
              loading
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
            <Download className="w-5 h-5 relative z-10" />
            <span className="relative z-10">
              {loading ? "Generating PDF..." : "Download Test Paper"}
            </span>
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
            )}
          </button>

          <button
            onClick={generateAnswerKey}
            disabled={loading}
            className={cn(
              "group relative overflow-hidden flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border-2",
              loading
                ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105"
            )}
          >
            <div className="absolute inset-0 bg-gray-50 dark:bg-gray-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
            <FileText className="w-5 h-5 relative z-10" />
            <span className="relative z-10">
              {loading ? "Generating Key..." : "Download Answer Key"}
            </span>
            {loading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin relative z-10"></div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
