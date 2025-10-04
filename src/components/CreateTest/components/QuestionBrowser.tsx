import { Eye, RefreshCw, Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { optimizedQuestionsAPI } from "../../../services/optimizedNeetAPI";
import type { Question } from "../../../types/neet";

interface QuestionBrowserProps {
  onSelectQuestions?: (questions: Question[]) => void;
  maxSelections?: number;
  showSelectionControls?: boolean;
  initialFilters?: {
    subject?: string;
    chapter?: string;
    difficulty?: string;
  };
}

export const QuestionBrowser: React.FC<QuestionBrowserProps> = ({
  onSelectQuestions,
  maxSelections = 100,
  showSelectionControls = false,
  initialFilters = {},
}) => {
  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);

  // Filters
  const [filters, setFilters] = useState({
    subject: initialFilters.subject || "",
    chapter: initialFilters.chapter || "",
    difficulty: initialFilters.difficulty || "",
    fields: "basic" as "minimal" | "basic" | "full",
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Available filter options
  const [filterOptions, setFilterOptions] = useState<{
    subjects: string[];
    chapters: string[];
    difficulties: string[];
  }>({
    subjects: [],
    chapters: [],
    difficulties: [],
  });

  // Load metadata and filter options
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [metadataResult, filtersResult] = await Promise.all([
          optimizedQuestionsAPI.getMetadata(),
          optimizedQuestionsAPI.getFilters(),
        ]);

        setMetadata(metadataResult);
        setFilterOptions(filtersResult);
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    };

    loadInitialData();
  }, []);

  // Load questions based on current filters
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: filters.limit,
        fields: filters.fields,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.chapter && { chapter: filters.chapter }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await optimizedQuestionsAPI.getPaginated(params);

      setQuestions(response.questions);
      setTotalPages(response.pagination.totalPages);
      setTotalQuestions(response.pagination.totalQuestions);
    } catch (err: any) {
      setError(err.message || "Failed to load questions");
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchTerm]);

  // Load questions when dependencies change
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Update filter options when subject changes
  useEffect(() => {
    if (filters.subject) {
      optimizedQuestionsAPI.getFilters(filters.subject).then((options) => {
        setFilterOptions((prev) => ({
          ...prev,
          chapters: options.chapters,
        }));
      });
    }
  }, [filters.subject]);

  // Handle question selection
  const handleQuestionSelect = useCallback(
    (questionId: string, selected: boolean) => {
      setSelectedQuestions((prev) => {
        const newSet = new Set(prev);
        if (selected && newSet.size < maxSelections) {
          newSet.add(questionId);
        } else if (!selected) {
          newSet.delete(questionId);
        }
        return newSet;
      });
    },
    [maxSelections]
  );

  // Handle bulk selection
  const handleSelectAll = useCallback(() => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      const newSelections = new Set(selectedQuestions);
      questions.forEach((q) => {
        if (newSelections.size < maxSelections) {
          newSelections.add(q._id);
        }
      });
      setSelectedQuestions(newSelections);
    }
  }, [questions, selectedQuestions, maxSelections]);

  // Send selected questions to parent
  useEffect(() => {
    if (onSelectQuestions && selectedQuestions.size > 0) {
      const selected = questions.filter((q) => selectedQuestions.has(q._id));
      onSelectQuestions(selected);
    }
  }, [selectedQuestions, questions, onSelectQuestions]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Memoized components
  const SearchBar = useMemo(
    () => (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search questions..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    ),
    [searchTerm, handleSearch]
  );

  const FilterControls = useMemo(
    () => (
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.subject}
          onChange={(e) => handleFilterChange("subject", e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Subjects</option>
          {filterOptions.subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        <select
          value={filters.chapter}
          onChange={(e) => handleFilterChange("chapter", e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={!filters.subject}
        >
          <option value="">All Chapters</option>
          {filterOptions.chapters.map((chapter) => (
            <option key={chapter} value={chapter}>
              {chapter}
            </option>
          ))}
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => handleFilterChange("difficulty", e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={filters.fields}
          onChange={(e) => handleFilterChange("fields", e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="basic">Basic Info</option>
          <option value="full">Full Details</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>
    ),
    [filters, filterOptions, handleFilterChange]
  );

  const Pagination = useMemo(
    () => (
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {(currentPage - 1) * filters.limit + 1} to{" "}
          {Math.min(currentPage * filters.limit, totalQuestions)} of{" "}
          {totalQuestions} questions
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    ),
    [currentPage, totalPages, totalQuestions, filters.limit]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Question Browser
          </h2>
          {metadata && (
            <p className="text-slate-600">
              Browse through {metadata.totalQuestions.toLocaleString()}{" "}
              questions
            </p>
          )}
        </div>

        {showSelectionControls && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {selectedQuestions.size}/{maxSelections} selected
            </span>
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
            >
              {selectedQuestions.size === questions.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {SearchBar}
        {FilterControls}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadQuestions}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-slate-600">Loading questions...</span>
        </div>
      )}

      {/* Questions List */}
      {!loading && (
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question._id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                selectedQuestions.has(question._id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {showSelectionControls && (
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(question._id)}
                    onChange={(e) =>
                      handleQuestionSelect(question._id, e.target.checked)
                    }
                    className="mt-1"
                  />
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded">
                      {question.subjectName}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded">
                      {question.chapterName}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        question.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : question.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  <p className="text-slate-800 mb-3 line-clamp-3">
                    {question.questionText}
                  </p>

                  {filters.fields !== "minimal" && (
                    <div className="space-y-2">
                      {question.options.map((option, idx) => {
                        const optionLabel = String.fromCharCode(65 + idx);
                        // Correct logic: correctAnswer is the text of the correct option (virtual field)
                        const isCorrectOption =
                          option.isCorrect ||
                          question.correctAnswer === option.text;

                        return (
                          <div
                            key={idx}
                            className={`text-sm p-2 rounded border-l-2 ${
                              isCorrectOption
                                ? "border-green-500 bg-green-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            {optionLabel}. {option.text}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {filters.fields === "full" && question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-1">
                        Explanation:
                      </h4>
                      <p className="text-blue-700 text-sm">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>Success Rate: {question.successRate}%</span>
                    <span>Attempts: {question.statistics.totalAttempts}</span>
                    {question.statistics.averageTimeSpent > 0 && (
                      <span>
                        Avg Time:{" "}
                        {Math.round(question.statistics.averageTimeSpent)}s
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && questions.length > 0 && Pagination}

      {/* Empty State */}
      {!loading && questions.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            No questions found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};
