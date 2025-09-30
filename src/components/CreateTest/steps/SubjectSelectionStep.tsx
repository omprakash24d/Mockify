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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl">
          <BookOpen className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Choose Your Subjects
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Select one or more subjects to include in your test. You can always
            adjust your selection later.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {stepLoading[1] && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Loading Subjects...
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Fetching the latest curriculum data
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!stepLoading[1] && subjects.length === 0 && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <BookOpen className="w-16 h-16 text-slate-400 dark:text-slate-600" />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              No Subjects Available
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
              We couldn't find any subjects in the database. Please contact
              support or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {!stepLoading[1] && subjects.length > 0 && (
        <>
          {/* Stats & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {subjects.length} Available Subjects
                </span>
              </div>
              {selectedSubjects.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-3 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {selectedSubjects.length} Selected
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubjects(subjects.map((s) => s.id))}
                className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 rounded-2xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubjects([])}
                disabled={selectedSubjects.length === 0}
                className="px-6 py-3 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject.id);
              return (
                <label
                  key={subject.id}
                  className={cn(
                    "group relative p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-y-1",
                    "border-2 shadow-lg hover:shadow-2xl",
                    isSelected
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-blue-200/50 dark:shadow-blue-900/30"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20"
                  )}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-6 right-6">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isSelected
                          ? "border-blue-500 bg-blue-500 shadow-lg"
                          : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400 group-hover:scale-110"
                      )}
                    >
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSubjectToggle(subject.id)}
                    className="sr-only"
                  />

                  <div className="space-y-5">
                    {/* Subject Icon */}
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                        isSelected
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      )}
                    >
                      <GraduationCap className="w-8 h-8" />
                    </div>

                    {/* Subject Info */}
                    <div className="space-y-3">
                      <h3
                        className={cn(
                          "font-bold text-xl transition-colors duration-300",
                          isSelected
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-slate-900 dark:text-slate-100"
                        )}
                      >
                        {subject.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {subject.chapters?.length || 0} chapters
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            ~{(subject.chapters?.length || 0) * 15} questions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Glow */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl pointer-events-none" />
                  )}
                </label>
              );
            })}
          </div>

          {/* Selection Summary */}
          {selectedSubjects.length > 0 && (
            <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-3xl border border-blue-200 dark:border-blue-800/50 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  Selected Subjects Summary
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSubjects.map((subjectId) => {
                  const subject = subjects.find((s) => s.id === subjectId);
                  if (!subject) return null;
                  return (
                    <div
                      key={subject.id}
                      className="flex items-center space-x-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-sm border border-white/50 dark:border-slate-700/50 backdrop-blur-sm"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                          {subject.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
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
