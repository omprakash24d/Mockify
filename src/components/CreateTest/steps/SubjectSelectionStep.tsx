import { BarChart3, BookOpen, CheckCircle, GraduationCap } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import type { StepComponentProps } from "../types";

export const SubjectSelectionStep: React.FC<StepComponentProps> = ({
  state,
  actions,
}) => {
  const { subjects, stepLoading, selectedSubjects } = state;
  const { setSelectedSubjects, handleSubjectToggle } = actions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
          Choose Your Subjects
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
          Select one or more subjects to include in your test. You can always
          adjust your selection later.
        </p>
      </div>

      {/* Loading State */}
      {stepLoading[1] && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
            Loading Subjects...
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center transition-colors duration-300">
            Fetching the latest curriculum data
          </p>
        </div>
      )}

      {/* Empty State */}
      {!stepLoading[1] && subjects.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
            No Subjects Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">
            We couldn't find any subjects in the database. Please contact
            support or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Reload Page
          </button>
        </div>
      )}

      {/* Subjects Grid */}
      {!stepLoading[1] && subjects.length > 0 && (
        <>
          {/* Stats & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  {subjects.length} Available Subjects
                </span>
              </div>
              {selectedSubjects.length > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {selectedSubjects.length} Selected
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedSubjects(subjects.map((s) => s.id))}
                className="px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubjects([])}
                disabled={selectedSubjects.length === 0}
                className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject.id);
              return (
                <label
                  key={subject.id}
                  className={cn(
                    "group relative p-6 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105",
                    "border-2 hover:shadow-lg",
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-300"
                  )}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 dark:border-gray-600 group-hover:border-blue-400"
                      )}
                    >
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSubjectToggle(subject.id)}
                    className="sr-only"
                  />

                  <div className="space-y-3">
                    {/* Subject Icon */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      )}
                    >
                      <GraduationCap className="w-6 h-6" />
                    </div>

                    {/* Subject Info */}
                    <div>
                      <h3
                        className={`font-semibold text-lg transition-colors duration-300 ${
                          isSelected
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {subject.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            {subject.chapters?.length || 0} chapters
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            ~{(subject.chapters?.length || 0) * 15} questions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none transition-opacity duration-200" />
                  )}
                </label>
              );
            })}
          </div>

          {/* Selection Summary */}
          {selectedSubjects.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Selected Subjects Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSubjects.map((subjectId) => {
                  const subject = subjects.find((s) => s.id === subjectId);
                  if (!subject) return null;
                  return (
                    <div
                      key={subject.id}
                      className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {subject.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {subject.chapters?.length || 0} chapters
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
