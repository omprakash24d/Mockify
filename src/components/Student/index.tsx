import React, { useCallback, useMemo, useState } from "react";
import { useQuestions } from "../../hooks/useQuestions";
import { Pagination } from "../NEETTestUI/components/Pagination";
import { QuestionCard } from "../NEETTestUI/components/QuestionCard";
import { QuickActionsSidebar } from "../NEETTestUI/components/QuickActionsSidebar";
import { SubjectFilter } from "../NEETTestUI/components/SubjectFilter";
import { TestBanner } from "../NEETTestUI/components/TestBanner";
import type { Question } from "../NEETTestUI/types";

export const NEETTestUI: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState("All");

  // Use real questions from database with randomization
  const {
    questions,
    loading,
    error,
    pagination,
    goToPage,
    fetchQuestions,
    refresh,
  } = useQuestions({
    subject: selectedSubject === "All" ? undefined : selectedSubject,
    limit: 10,
    page: 1,
  });

  const handleSubjectChange = useCallback(
    (subject: string) => {
      setSelectedSubject(subject);
      // Fetch questions for the new subject
      fetchQuestions({
        subject: subject === "All" ? undefined : subject,
        limit: 10,
        page: 1,
      });
    },
    [fetchQuestions]
  );

  // Memoize question transformations to prevent unnecessary re-computations
  const transformedQuestions = useMemo(() => {
    return questions.map((question: any, index: number) => ({
      key:
        question._id ||
        question.id ||
        `${selectedSubject}-${pagination.currentPage}-${index}`,
      transformedQuestion: {
        id: question._id || question.id || `q-${index}`,
        subject:
          question.subjectName === "Physics" ||
          question.subjectName === "Chemistry" ||
          question.subjectName === "Botany" ||
          question.subjectName === "Zoology"
            ? question.subjectName
            : "Physics",
        text: question.questionText || "",
        options: (question.options?.map((opt: any) =>
          typeof opt === "string" ? opt : opt?.text || String(opt)
        ) || []) as string[],
        correctAnswer:
          question.options?.findIndex(
            (opt: any) => typeof opt === "object" && opt?.isCorrect
          ) || 0,
        difficulty:
          question.difficulty === "easy"
            ? "Level 1"
            : question.difficulty === "medium"
            ? "Level 2"
            : "Level 3",
        topic: question.chapterName || "General",
        percentageCorrect: Math.floor(Math.random() * 40) + 50,
        ncertReference: true,
      },
      questionNumber: (pagination.currentPage - 1) * 10 + index + 1,
    }));
  }, [questions, selectedSubject, pagination.currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TestBanner />
      <QuickActionsSidebar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Subject Filter and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SubjectFilter
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
          />
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Loading..." : "Refresh Questions"}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading questions...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading questions
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        {!loading && !error && (
          <div className="space-y-4 mb-8">
            {transformedQuestions.length > 0 ? (
              transformedQuestions.map(
                ({ key, transformedQuestion, questionNumber }) => (
                  <QuestionCard
                    key={key}
                    question={transformedQuestion as Question}
                    questionNumber={questionNumber}
                  />
                )
              )
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No questions found
                </h3>
                <p className="text-gray-500">
                  Try selecting a different subject or check back later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && questions.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
          />
        )}
      </main>
    </div>
  );
};
