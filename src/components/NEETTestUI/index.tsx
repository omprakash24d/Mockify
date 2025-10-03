import React, { useState } from "react";
import { Pagination } from "./components/Pagination";
import { QuestionCard } from "./components/QuestionCard";
import { QuickActionsSidebar } from "./components/QuickActionsSidebar";
import { SubjectFilter } from "./components/SubjectFilter";
import { TestBanner } from "./components/TestBanner";
import { mockQuestions } from "./data/mockQuestions";
import type { Question } from "./types";

export const NEETTestUI: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  // Filter questions based on selected subject
  const filteredQuestions =
    selectedSubject === "All"
      ? mockQuestions
      : mockQuestions.filter((q: Question) => q.subject === selectedSubject);

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + questionsPerPage
  );

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentPage(1); // Reset to first page when changing subject
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TestBanner />
      <QuickActionsSidebar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Subject Filter */}
        <div className="mb-6">
          <SubjectFilter
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
          />
        </div>

        {/* Questions List */}
        <div className="space-y-4 mb-8">
          {currentQuestions.length > 0 ? (
            currentQuestions.map((question: Question, index: number) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={startIndex + index + 1}
              />
            ))
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
};
