import { BookOpen, RotateCcw, Search, Target } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useQuestions, useRandomQuestions } from "../../hooks/useQuestions.ts";
import { useSubjects } from "../../hooks/useSubjects.ts";
import { cn } from "../../lib/utils";
import type { Question, Subject } from "../../types/neet";
import { LoadingSpinner } from "../LoadingSpinner";
import Pagination from "./Pagination.tsx";
import QuestionCard from "./QuestionCard.tsx";
import SubjectGrid from "./SubjectGrid.tsx";

const NEETDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "subjects" | "questions" | "practice"
  >("subjects");
  const [, setSelectedSubject] = useState<Subject | null>(null);
  const [, setSelectedChapter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    difficulty: "",
    subject: "",
    chapter: "",
  });

  const {
    subjects,
    loading: subjectsLoading,
    error: subjectsError,
  } = useSubjects();
  const {
    questions,
    loading: questionsLoading,
    pagination,
    fetchQuestions,
    nextPage,
    prevPage,
    goToPage,
  } = useQuestions();
  const {
    questions: randomQuestions,
    loading: randomLoading,
    refresh: refreshRandom,
  } = useRandomQuestions({ count: 5 });

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeTab === "questions") fetchQuestions(filters);
  }, [activeTab, filters, fetchQuestions]);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setActiveTab("questions");
    setFilters((prev) => ({ ...prev, subject: subject.name }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActiveTab("questions");
      fetchQuestions({ ...filters, search: searchTerm });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ difficulty: "", subject: "", chapter: "" });
    setSearchTerm("");
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const renderSubjectsTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          NEET Subjects
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a subject to start practicing questions
        </p>
      </div>

      {subjectsLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : subjectsError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Error loading subjects: {subjectsError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <SubjectGrid subjects={subjects} onSubjectClick={handleSubjectClick} />
      )}
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Search & Filter
        </h3>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 mb-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject: Subject) => (
              <option key={subject.name} value={subject.name}>
                {subject.displayName}
              </option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {questionsLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question: Question) => (
            <QuestionCard
              key={question._id}
              question={question}
              selectedAnswer={selectedAnswers[question._id]}
              showResult={showResults[question._id]}
              onAnswerSelect={(answer: string) =>
                handleAnswerSelect(question._id, answer)
              }
            />
          ))}

          {questions.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              onNext={nextPage}
              onPrev={prevPage}
              onPageClick={goToPage}
              totalItems={pagination.totalQuestions}
            />
          )}
        </div>
      )}
    </div>
  );

  const renderPracticeTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Practice Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Test your knowledge with random questions
            </p>
          </div>
          <button
            onClick={refreshRandom}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            <RotateCcw className="w-4 h-4" />
            New Questions
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {randomQuestions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Questions
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              Mixed
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Difficulty
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              All
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Subjects
            </div>
          </div>
        </div>
      </div>

      {randomLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-6">
          {randomQuestions.map((question: Question) => (
            <QuestionCard
              key={question._id}
              question={question}
              selectedAnswer={selectedAnswers[question._id]}
              showResult={showResults[question._id]}
              onAnswerSelect={(answer: string) =>
                handleAnswerSelect(question._id, answer)
              }
            />
          ))}

          {randomQuestions.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Target className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Ready to practice?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click "New Questions" to start practicing.
              </p>
              <button
                onClick={refreshRandom}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Load Practice Questions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 neet-prep-font">
      {/* NEET-style Header Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 dark:bg-white/10 rounded-lg mb-4">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">NEET Question Bank</h1>
            <p className="text-lg text-blue-100 dark:text-blue-200">
              Master your NEET preparation with comprehensive practice
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-1">
            <nav className="flex gap-1">
              {[
                { id: "subjects", icon: BookOpen, label: "Subjects" },
                { id: "questions", icon: Search, label: "Questions" },
                { id: "practice", icon: Target, label: "Practice" },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "subjects" && renderSubjectsTab()}
          {activeTab === "questions" && renderQuestionsTab()}
          {activeTab === "practice" && renderPracticeTab()}
        </div>
      </div>
    </div>
  );
};

export default NEETDashboard;
