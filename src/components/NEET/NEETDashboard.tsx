import { BookOpen, RotateCcw, Search, Target } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useQuestions, useRandomQuestions } from "../../hooks/useQuestions.ts";
import { useSubjects } from "../../hooks/useSubjects.ts";
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

  // Hooks
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

  // State for practice mode
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeTab === "questions") {
      fetchQuestions(filters);
    }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">NEET Subjects</h2>
        <p className="text-gray-600">
          Choose a subject to start practicing questions
        </p>
      </div>

      {subjectsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : subjectsError ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            Error loading subjects: {subjectsError}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <form onSubmit={handleSearch} className="flex space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4">
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      {questionsLoading ? (
        <div className="flex justify-center py-12">
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
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters.
              </p>
            </div>
          )}

          {/* Pagination */}
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
              className="border-t border-gray-200"
            />
          )}
        </div>
      )}
    </div>
  );

  const renderPracticeTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Practice Mode</h2>
          <button
            onClick={refreshRandom}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
          >
            <RotateCcw size={16} />
            <span>New Questions</span>
          </button>
        </div>
        <p className="text-gray-600">
          Practice with random questions to test your knowledge
        </p>
      </div>

      {randomLoading ? (
        <div className="flex justify-center py-12">
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
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NEET Question Bank
          </h1>
          <p className="text-gray-600">
            Master your NEET preparation with comprehensive question practice
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("subjects")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "subjects"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} />
                  <span>Subjects</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("questions")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "questions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Search size={16} />
                  <span>Questions</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("practice")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "practice"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target size={16} />
                  <span>Practice</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "subjects" && renderSubjectsTab()}
        {activeTab === "questions" && renderQuestionsTab()}
        {activeTab === "practice" && renderPracticeTab()}
      </div>
    </div>
  );
};

export default NEETDashboard;
