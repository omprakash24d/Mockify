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
      <div className="text-center mb-8">
        <Settings className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
          Configure Your Test
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
          Customize your test parameters to match your requirements and student
          levels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Settings */}
        <div className="space-y-6">
          {/* Test Title */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  Test Information
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Basic test details
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                Test Title *
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter a descriptive test title"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
                This will appear on the test paper and PDF
              </p>
            </div>
          </div>

          {/* Question Count */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  Question Count
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  How many questions to include
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  Number of Questions
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {testFilters.questionCount}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    questions
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={testFilters.questionCount}
                onChange={(e) =>
                  handleFilterChange("questionCount", parseInt(e.target.value))
                }
                className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    (testFilters.questionCount - 10) / 0.9
                  }%, #e5e7eb ${
                    (testFilters.questionCount - 10) / 0.9
                  }%, #e5e7eb 100%)`,
                }}
              />

              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>10</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {QUESTION_COUNT_PRESETS.map((count) => (
                  <button
                    key={count}
                    onClick={() => handleFilterChange("questionCount", count)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      testFilters.questionCount === count
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Levels */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  Difficulty Levels
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Select question difficulty mix
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {DIFFICULTY_LEVELS.map(
                ({ value, label, color, icon, description }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                      testFilters.difficulty.includes(value as any)
                        ? `border-${color}-300 dark:border-${color}-600 bg-${color}-50 dark:bg-${color}-900/20`
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={testFilters.difficulty.includes(value as any)}
                        onChange={(e) => {
                          const difficulties = e.target.checked
                            ? [...testFilters.difficulty, value as any]
                            : testFilters.difficulty.filter((d) => d !== value);
                          handleFilterChange("difficulty", difficulties);
                        }}
                        className={`w-5 h-5 text-${color}-600 rounded focus:ring-${color}-500 transition-colors`}
                      />
                      <span className="text-lg">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        {label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {description}
                      </div>
                    </div>
                    {testFilters.difficulty.includes(value as any) && (
                      <CheckCircle className={`w-5 h-5 text-${color}-600`} />
                    )}
                  </label>
                )
              )}
            </div>

            {testFilters.difficulty.length === 0 && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Please select at least one difficulty level
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Advanced Options */}
        <div className="space-y-6">
          {/* Additional Options */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  Additional Options
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Customize test content
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label
                className={cn(
                  "flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                  testFilters.includeImages
                    ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                )}
              >
                <input
                  type="checkbox"
                  checked={testFilters.includeImages}
                  onChange={(e) =>
                    handleFilterChange("includeImages", e.target.checked)
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    Include Image Questions
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Add questions that contain diagrams and images
                  </div>
                </div>
                {testFilters.includeImages && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </label>

              <label
                className={cn(
                  "flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                  testFilters.onlyPYQs
                    ? "border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                )}
              >
                <input
                  type="checkbox"
                  checked={testFilters.onlyPYQs}
                  onChange={(e) =>
                    handleFilterChange("onlyPYQs", e.target.checked)
                  }
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    Previous Year Questions Only
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Include only questions from previous year exams
                  </div>
                </div>
                {testFilters.onlyPYQs && (
                  <CheckCircle className="w-5 h-5 text-purple-600" />
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
