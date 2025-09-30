import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Eye,
  FileText,
  Settings,
} from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import type { StepComponentProps } from "../types";
import { DIFFICULTY_LEVELS, QUESTION_COUNT_PRESETS } from "../utils/constants";

export const TestConfigurationStep: React.FC<StepComponentProps> = ({
  state,
  actions,
}) => {
  const {
    testTitle,
    testFilters,
    subjects,
    chapters,
    selectedSubjects,
    selectedChapters,
  } = state;
  const { setTestTitle, handleFilterChange } = actions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-2xl">
          <Settings className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Configure Your Test
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Customize your test parameters to match your requirements and
            student levels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column - Basic Settings */}
        <div className="space-y-8">
          {/* Test Title */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Test Information
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Basic test details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                Test Title *
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder:text-slate-400"
                placeholder="Enter a descriptive test title"
              />
              <p className="text-xs text-slate-500 dark:text-slate-500">
                This will appear on the test paper and PDF
              </p>
            </div>
          </div>

          {/* Question Count */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Question Count
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  How many questions to include
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Number of Questions
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {testFilters.questionCount}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    questions
                  </span>
                </div>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={testFilters.questionCount}
                  onChange={(e) =>
                    handleFilterChange(
                      "questionCount",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div
                  className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg pointer-events-none transition-all duration-300"
                  style={{
                    width: `${((testFilters.questionCount - 10) / 90) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-500 mt-3">
                <span>10</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-3">
                {QUESTION_COUNT_PRESETS.map((count) => (
                  <button
                    key={count}
                    onClick={() => handleFilterChange("questionCount", count)}
                    className={cn(
                      "px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 border-2",
                      testFilters.questionCount === count
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Levels */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Difficulty Levels
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Select question difficulty mix
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {DIFFICULTY_LEVELS.map(
                ({ value, label, color, icon, description }) => {
                  const isSelected = testFilters.difficulty.includes(
                    value as any
                  );
                  const colorClasses = {
                    green: {
                      border: isSelected
                        ? "border-emerald-300 dark:border-emerald-600"
                        : "border-slate-200 dark:border-slate-700",
                      bg: isSelected
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : "bg-slate-50 dark:bg-slate-800",
                      checkbox: "text-emerald-600 focus:ring-emerald-500",
                      checkmark: "text-emerald-600",
                    },
                    yellow: {
                      border: isSelected
                        ? "border-amber-300 dark:border-amber-600"
                        : "border-slate-200 dark:border-slate-700",
                      bg: isSelected
                        ? "bg-amber-50 dark:bg-amber-900/20"
                        : "bg-slate-50 dark:bg-slate-800",
                      checkbox: "text-amber-600 focus:ring-amber-500",
                      checkmark: "text-amber-600",
                    },
                    red: {
                      border: isSelected
                        ? "border-red-300 dark:border-red-600"
                        : "border-slate-200 dark:border-slate-700",
                      bg: isSelected
                        ? "bg-red-50 dark:bg-red-900/20"
                        : "bg-slate-50 dark:bg-slate-800",
                      checkbox: "text-red-600 focus:ring-red-500",
                      checkmark: "text-red-600",
                    },
                  }[color] || {
                    border: "border-slate-200 dark:border-slate-700",
                    bg: "bg-slate-50 dark:bg-slate-800",
                    checkbox: "text-slate-600 focus:ring-slate-500",
                    checkmark: "text-slate-600",
                  };

                  return (
                    <label
                      key={value}
                      className={cn(
                        "flex items-center space-x-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 hover:shadow-lg",
                        colorClasses.border,
                        colorClasses.bg,
                        isSelected
                          ? "shadow-md"
                          : "hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const difficulties = e.target.checked
                              ? [...testFilters.difficulty, value as any]
                              : testFilters.difficulty.filter(
                                  (d) => d !== value
                                );
                            handleFilterChange("difficulty", difficulties);
                          }}
                          className={cn(
                            "w-5 h-5 rounded focus:ring-2 transition-colors",
                            colorClasses.checkbox
                          )}
                        />
                        <span className="text-2xl">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {label}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {description}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle
                          className={cn("w-6 h-6", colorClasses.checkmark)}
                        />
                      )}
                    </label>
                  );
                }
              )}
            </div>

            {testFilters.difficulty.length === 0 && (
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl">
                <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center font-medium">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  Please select at least one difficulty level
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Advanced Options */}
        <div className="space-y-8">
          {/* Additional Options */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Additional Options
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Customize test content
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label
                className={cn(
                  "flex items-center space-x-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 hover:shadow-lg",
                  testFilters.includeImages
                    ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600"
                )}
              >
                <input
                  type="checkbox"
                  checked={testFilters.includeImages}
                  onChange={(e) =>
                    handleFilterChange("includeImages", e.target.checked)
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    Include Image Questions
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Add questions that contain diagrams and images
                  </div>
                </div>
                {testFilters.includeImages && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </label>

              <label
                className={cn(
                  "flex items-center space-x-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 hover:shadow-lg",
                  testFilters.onlyPYQs
                    ? "border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-600"
                )}
              >
                <input
                  type="checkbox"
                  checked={testFilters.onlyPYQs}
                  onChange={(e) =>
                    handleFilterChange("onlyPYQs", e.target.checked)
                  }
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 transition-colors"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    Previous Year Questions Only
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Include only questions from previous year exams
                  </div>
                </div>
                {testFilters.onlyPYQs && (
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                )}
              </label>
            </div>
          </div>

          {/* Test Preview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  Test Preview
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Quick overview of your test
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Title
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate transition-colors duration-300">
                    {testTitle || "Untitled Test"}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Questions
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {testFilters.questionCount}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                  Subjects & Chapters
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedSubjects.map((id) => {
                    const subject = subjects.find((s) => s.id === id);
                    const subjectChapters = chapters.filter(
                      (c) =>
                        c.subject_id === id && selectedChapters.includes(c.id)
                    ).length;
                    return (
                      <span
                        key={id}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs"
                      >
                        {subject?.name} ({subjectChapters})
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                  Difficulty Mix
                </div>
                <div className="flex space-x-2">
                  {testFilters.difficulty.map((diff) => (
                    <span
                      key={diff}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        diff === "easy" &&
                          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
                        diff === "medium" &&
                          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
                        diff === "hard" &&
                          "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                      )}
                    >
                      {diff}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
