import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  Users,
} from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import type { StepComponentProps } from "../types";
import {
  calculateEstimatedQuestions,
  calculateTotalTopics,
} from "../utils/helpers";

export const ChapterSelectionStep: React.FC<StepComponentProps> = ({
  state,
  actions,
}) => {
  const {
    subjects,
    chapters,
    stepLoading,
    selectedSubjects,
    selectedChapters,
  } = state;
  const { setSelectedChapters, handleChapterToggle, setCurrentStep } = actions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl">
          <GraduationCap className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Select Chapters
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Choose specific chapters from your selected subjects to focus your
            test content.
          </p>
        </div>
      </div>

      {/* Selected Subjects Summary */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 p-8 rounded-3xl border border-indigo-200 dark:border-indigo-800/50 shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
            Selected Subjects
          </h4>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedSubjects.map((id) => {
            const subject = subjects.find((s) => s.id === id);
            return (
              <span
                key={id}
                className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-indigo-800 dark:text-indigo-200 rounded-2xl text-sm font-semibold border border-indigo-200 dark:border-indigo-700/50 shadow-sm backdrop-blur-sm"
              >
                {subject?.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {stepLoading[2] && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Loading Chapters...
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Fetching chapters for your selected subjects
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!stepLoading[2] &&
        chapters.length === 0 &&
        selectedSubjects.length > 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <GraduationCap className="w-16 h-16 text-slate-400 dark:text-slate-600" />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                No Chapters Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                We couldn't find any chapters for your selected subjects. Please
                try selecting different subjects.
              </p>
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Go Back to Subjects
              </button>
            </div>
          </div>
        )}

      {/* Chapters Content */}
      {!stepLoading[2] && chapters.length > 0 && (
        <>
          {/* Stats & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {chapters.length} Available Chapters
                </span>
              </div>
              {selectedChapters.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    {selectedChapters.length} Selected
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedChapters(chapters.map((c) => c.id))}
                className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300 rounded-2xl hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedChapters([])}
                disabled={selectedChapters.length === 0}
                className="px-6 py-3 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Chapters by Subject */}
          <div className="space-y-6">
            {selectedSubjects.map((subjectId) => {
              const subject = subjects.find((s) => s.id === subjectId);
              const subjectChapters = chapters.filter(
                (c) => c.subject_id === subjectId
              );

              if (subjectChapters.length === 0) return null;

              const selectedInSubject = subjectChapters.filter((c) =>
                selectedChapters.includes(c.id)
              ).length;

              return (
                <div
                  key={subjectId}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-200 hover:shadow-lg"
                >
                  {/* Subject Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                          {subject?.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          {subjectChapters.length} chapters •{" "}
                          {selectedInSubject} selected
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const subjectChapterIds = subjectChapters.map(
                          (c) => c.id
                        );
                        const allSelected = subjectChapterIds.every((id) =>
                          selectedChapters.includes(id)
                        );

                        if (allSelected) {
                          setSelectedChapters((prev) =>
                            prev.filter((id) => !subjectChapterIds.includes(id))
                          );
                        } else {
                          setSelectedChapters((prev) => [
                            ...new Set([...prev, ...subjectChapterIds]),
                          ]);
                        }
                      }}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors border",
                        subjectChapters.every((c) =>
                          selectedChapters.includes(c.id)
                        )
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}
                    >
                      {subjectChapters.every((c) =>
                        selectedChapters.includes(c.id)
                      )
                        ? "Unselect All"
                        : "Select All"}
                    </button>
                  </div>

                  {/* Chapters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subjectChapters.map((chapter) => {
                      const isSelected = selectedChapters.includes(chapter.id);
                      return (
                        <label
                          key={chapter.id}
                          className={cn(
                            "group relative p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                            isSelected
                              ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm"
                              : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all duration-200",
                                isSelected
                                  ? "border-indigo-500 bg-indigo-500"
                                  : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"
                              )}
                            >
                              {isSelected && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5
                                className={`font-medium text-sm transition-colors duration-300 ${
                                  isSelected
                                    ? "text-indigo-900 dark:text-indigo-100"
                                    : "text-gray-900 dark:text-gray-100"
                                } mb-1`}
                              >
                                {chapter.chapter_name}
                              </h5>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>
                                    {chapter.topics?.length || 0} topics
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <BarChart3 className="w-3 h-3" />
                                  <span>
                                    ~
                                    {Math.max(
                                      1,
                                      (chapter.topics?.length || 0) * 3
                                    )}{" "}
                                    questions
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleChapterToggle(chapter.id)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selection Summary */}
          {selectedChapters.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Chapter Selection Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Total Chapters
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {selectedChapters.length}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Total Topics
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {calculateTotalTopics(
                        chapters.filter((c) => selectedChapters.includes(c.id))
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Est. Questions
                    </div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      ~
                      {calculateEstimatedQuestions(
                        chapters.filter((c) => selectedChapters.includes(c.id))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
