import { Eye, RefreshCw, Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { optimizedQuestionsAPI } from "../../../services/optimizedNeetAPI";

interface SimpleQuestionBrowserProps {
  onSelectQuestions?: (questions: any[]) => void;
  maxSelections?: number;
  showSelectionControls?: boolean;
  initialFilters?: {
    subject?: string;
    chapter?: string;
    difficulty?: string;
  };
}

export const SimpleQuestionBrowser: React.FC<SimpleQuestionBrowserProps> = ({
  onSelectQuestions,
  maxSelections = 100,
  showSelectionControls = false,
  initialFilters = {},
}) => {
  // State
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    subject: initialFilters.subject || "",
    chapter: initialFilters.chapter || "",
    difficulty: initialFilters.difficulty || "",
    fields: "basic" as "minimal" | "basic" | "full",
    limit: 20,
  });

  // Available filter options
  const [filterOptions, setFilterOptions] = useState<{
    subjects: string[];
    chapters: string[];
  }>({
    subjects: [],
    chapters: [],
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const filtersResult = await optimizedQuestionsAPI.getFilters();
        setFilterOptions(filtersResult);
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    };

    loadInitialData();
  }, []);

  // Load questions
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: filters.limit,
        fields: filters.fields,
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

  // Send selected questions to parent (simplified)
  useEffect(() => {
    if (onSelectQuestions && selectedQuestions.size > 0) {
      const selected = questions.filter((q) =>
        selectedQuestions.has(q._id || q.id)
      );
      onSelectQuestions(selected);
    }
  }, [selectedQuestions, questions, onSelectQuestions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Question Browser
          </h2>
          <p className="text-slate-600">
            Browse and select questions for your test
          </p>
        </div>

        {showSelectionControls && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {selectedQuestions.size}/{maxSelections} selected
            </span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <select
            value={filters.subject}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, subject: e.target.value }))
            }
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
            value={filters.difficulty}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
            }
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
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
              key={question._id || question.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                selectedQuestions.has(question._id || question.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {showSelectionControls && (
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(question._id || question.id)}
                    onChange={(e) =>
                      handleQuestionSelect(
                        question._id || question.id,
                        e.target.checked
                      )
                    }
                    className="mt-1"
                  />
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded">
                      {question.subjectName || question.subject_id}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded">
                      {question.chapterName || question.chapter_id}
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
                    {question.questionText || question.question_text}
                  </p>

                  {question.options && (
                    <div className="space-y-2">
                      {question.options.map((option: any, idx: number) => {
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && questions.length > 0 && (
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
      )}

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
