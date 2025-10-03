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
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-2xl">
          <Eye className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Preview & Generate Test
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Review your test configuration and generate PDF files when ready.
          </p>
        </div>
      </div>

      {/* Load Questions CTA */}
      {questions.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <RefreshCw className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Ready to Generate Questions
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
              Click the button below to generate questions based on your
              selected criteria. This may take a few moments.
            </p>
            <button
              onClick={loadQuestions}
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 text-lg"
            >
              <RefreshCw className="w-6 h-6 mr-3" />
              Generate Questions
            </button>
          </div>
        </div>
      )}

      {/* Test Summary - Always show */}
      <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/10 dark:via-green-900/10 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-8 lg:p-10 shadow-xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              Test Configuration Summary
            </h3>
            <p className="text-emerald-700 dark:text-emerald-300 text-lg">
              Your test is configured with the following parameters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Title
              </span>
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-lg truncate">
              {testTitle || "Untitled Test"}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Subjects
              </span>
            </div>
            <div className="font-bold text-2xl text-slate-900 dark:text-slate-100 mb-2">
              {selectedSubjects.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {selectedSubjects
                .map((id) => subjects.find((s) => s.id === id)?.name)
                .join(", ")}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Chapters
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {selectedChapters.length}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Target Questions
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {testFilters.questionCount}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Difficulty
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {testFilters.difficulty.map((diff) => (
                <span
                  key={diff}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold shadow-sm",
                    diff === "easy" &&
                      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
                    diff === "medium" &&
                      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                    diff === "hard" &&
                      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  )}
                >
                  {diff}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Generated Questions
              </span>
            </div>
            <div
              className={`text-3xl font-bold transition-colors duration-300 ${
                questions.length > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {questions.length > 0 ? questions.length : "Not loaded"}
            </div>
            {questions.length > 0 && (
              <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-3xl overflow-hidden transition-colors duration-300 shadow-xl">
          <div className="p-8 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                    Questions Preview
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                    Showing {Math.min(5, questions.length)} of{" "}
                    {questions.length} questions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {questions.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300 font-semibold">
                  Total Questions
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {questions.slice(0, 5).map((question, index) => (
                <div
                  key={question.id}
                  className="p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 transition-colors duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="font-bold text-lg text-slate-900 dark:text-slate-100 transition-colors duration-300">
                      Q{index + 1}.
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-xl text-xs font-bold shadow-sm",
                          question.difficulty === "easy"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : question.difficulty === "medium"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        )}
                      >
                        {question.difficulty}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 transition-colors duration-300 font-semibold shadow-sm">
                        {question.marks || 1} marks
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-900 dark:text-slate-100 mb-4 leading-relaxed transition-colors duration-300">
                    {question.question_text.length > 200
                      ? `${question.question_text.substring(0, 200)}...`
                      : question.question_text}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-2 transition-colors duration-300">
                    <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                      <GraduationCap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="font-medium">
                      {chapters.find((c) => c.id === question.chapter_id)
                        ?.chapter_name || "Unknown Chapter"}
                    </span>
                  </div>
                </div>
              ))}

              {questions.length > 5 && (
                <div className="text-center py-6 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-700 dark:via-slate-700 dark:to-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 transition-colors duration-300 shadow-sm">
                  <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold transition-colors duration-300">
                    ... and {questions.length - 5} more questions
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300 font-medium">
                    Total marks:{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {calculateTotalMarks(questions)}
                    </span>
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
