import React, { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { LoadingSpinner } from "../LoadingSpinner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { BulkOperationModal } from "./BulkOperationModal";
import { EnhancedQuestionModal } from "./EnhancedQuestionModal";
import { ImportModal } from "./ImportModal";

interface Question {
  id: string;
  questionText: string;
  subjectName: string;
  chapterName: string;
  difficulty: "Easy" | "Medium" | "Hard";
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subtopics?: string[];
  yearAppeared?: number;
  statistics: {
    totalAttempts: number;
    correctAttempts: number;
    averageTimeSpent: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface QuestionFilters {
  search: string;
  subject: string;
  chapter: string;
  difficulty: string;
  yearFrom: string;
  yearTo: string;
  minAccuracy: string;
  maxAccuracy: string;
  tags: string[];
}

interface BulkOperation {
  type: "update" | "delete" | "duplicate";
  data?: Partial<Question>;
}

const AdminDashboard: React.FC = () => {
  // State Management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Search
  const [filters, setFilters] = useState<QuestionFilters>({
    search: "",
    subject: "",
    chapter: "",
    difficulty: "",
    yearFrom: "",
    yearTo: "",
    minAccuracy: "",
    maxAccuracy: "",
    tags: [],
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  // Selection and Bulk Operations
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(
    null
  );
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // API Base URL
  const API_BASE = "/api";

  // Fetch Data
  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, [debouncedSearch, filters, currentPage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.chapter && { chapter: filters.chapter }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.yearFrom && { yearFrom: filters.yearFrom }),
        ...(filters.yearTo && { yearTo: filters.yearTo }),
        ...(filters.minAccuracy && { minAccuracy: filters.minAccuracy }),
        ...(filters.maxAccuracy && { maxAccuracy: filters.maxAccuracy }),
      });

      const response = await fetch(`${API_BASE}/questions?${params}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data.questions || []);
        setTotalCount(data.data.pagination?.total || 0);
      } else {
        throw new Error(data.error || "Failed to fetch questions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/subjects`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSubjects(data.data.map((s: any) => s.name));
      } else {
        console.warn("API returned unsuccessful response:", data);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      // Set empty array to prevent UI breaking
      setSubjects([]);
    }
  };

  const fetchChapters = async (subject: string) => {
    if (!subject) {
      setChapters([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/chapters/${encodeURIComponent(subject)}`
      );
      const data = await response.json();
      if (data.success) {
        setChapters(data.data.map((c: any) => c.name));
      }
    } catch (err) {
      console.error("Failed to fetch chapters:", err);
    }
  };

  // Update chapters when subject changes
  useEffect(() => {
    fetchChapters(filters.subject);
  }, [filters.subject]);

  // Filter Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      // Calculate accuracy percentage
      const accuracy =
        question.statistics.totalAttempts > 0
          ? (question.statistics.correctAttempts /
              question.statistics.totalAttempts) *
            100
          : 0;

      // Apply filters
      if (filters.minAccuracy && accuracy < parseFloat(filters.minAccuracy))
        return false;
      if (filters.maxAccuracy && accuracy > parseFloat(filters.maxAccuracy))
        return false;

      // Tag filtering (if question has subtopics)
      if (filters.tags.length > 0 && question.subtopics) {
        const hasTag = filters.tags.some((tag) =>
          question.subtopics!.some((subtopic) =>
            subtopic.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasTag) return false;
      }

      return true;
    });
  }, [questions, filters]);

  // Selection Handlers
  const handleSelectQuestion = (questionId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedQuestions);
    if (isSelected) {
      newSelection.add(questionId);
    } else {
      newSelection.delete(questionId);
    }
    setSelectedQuestions(newSelection);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedQuestions(new Set(filteredQuestions.map((q) => q.id)));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  // CRUD Operations
  const handleCreateQuestion = async (questionData: Partial<Question>) => {
    try {
      const response = await fetch(`${API_BASE}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchQuestions();
        setShowCreateModal(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create question"
      );
    }
  };

  const handleUpdateQuestion = async (
    questionId: string,
    updates: Partial<Question>
  ) => {
    try {
      const response = await fetch(`${API_BASE}/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        await fetchQuestions();
        setShowEditModal(false);
        setEditingQuestion(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update question"
      );
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`${API_BASE}/questions/${questionId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchQuestions();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete question"
      );
    }
  };

  // Bulk Operations
  const handleBulkOperation = async () => {
    if (!bulkOperation || selectedQuestions.size === 0) return;

    try {
      let endpoint = "";
      let method = "POST";
      let body: any = {};

      switch (bulkOperation.type) {
        case "update":
          endpoint = `${API_BASE}/admin/questions/bulk`;
          method = "PUT";
          body = {
            updates: Array.from(selectedQuestions).map((id) => ({
              id,
              data: bulkOperation.data,
            })),
          };
          break;

        case "delete":
          endpoint = `${API_BASE}/admin/questions/bulk`;
          method = "DELETE";
          body = { ids: Array.from(selectedQuestions) };
          break;

        case "duplicate":
          endpoint = `${API_BASE}/admin/questions/duplicate`;
          method = "POST";
          body = {
            sourceIds: Array.from(selectedQuestions),
            modifications: bulkOperation.data,
          };
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        await fetchQuestions();
        setSelectedQuestions(new Set());
        setShowBulkModal(false);
        setBulkOperation(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk operation failed");
    }
  };

  // Import/Export Operations
  const handleImport = async (data: any, format: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/questions/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, format }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchQuestions();
        setShowImportModal(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    }
  };

  const handleExport = async (format: string = "json") => {
    try {
      const params = new URLSearchParams({
        format,
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.chapter && { chapter: filters.chapter }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
      });

      const response = await fetch(
        `${API_BASE}/admin/questions/export?${params}`
      );

      if (format === "csv") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "questions.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "questions.json";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  // Render Functions
  const renderFilters = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Advanced Filters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="col-span-full md:col-span-2">
          <Input
            type="text"
            placeholder="Search questions by text, subject, or topic..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="h-12 text-base"
          />
        </div>

        <select
          value={filters.subject}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              subject: e.target.value,
              chapter: "",
            }))
          }
          className="h-12 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        <select
          value={filters.chapter}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, chapter: e.target.value }))
          }
          className="h-12 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          disabled={!filters.subject}
        >
          <option value="">All Chapters</option>
          {chapters.map((chapter) => (
            <option key={chapter} value={chapter}>
              {chapter}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <select
          value={filters.difficulty}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
          }
          className="h-12 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Difficulty Levels</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <Input
          type="number"
          placeholder="From Year (e.g., 2010)"
          value={filters.yearFrom}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, yearFrom: e.target.value }))
          }
          className="h-12"
        />

        <Input
          type="number"
          placeholder="To Year (e.g., 2024)"
          value={filters.yearTo}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, yearTo: e.target.value }))
          }
          className="h-12"
        />

        <div className="flex gap-3">
          <Input
            type="number"
            placeholder="Min Accuracy %"
            value={filters.minAccuracy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minAccuracy: e.target.value }))
            }
            className="flex-1 h-12"
          />
          <Input
            type="number"
            placeholder="Max Accuracy %"
            value={filters.maxAccuracy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxAccuracy: e.target.value }))
            }
            className="flex-1 h-12"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
          Showing{" "}
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {filteredQuestions.length}
          </span>{" "}
          of <span className="font-bold">{totalCount}</span> questions
        </div>
        <Button
          variant="outline"
          className="shadow-sm"
          onClick={() =>
            setFilters({
              search: "",
              subject: "",
              chapter: "",
              difficulty: "",
              yearFrom: "",
              yearTo: "",
              minAccuracy: "",
              maxAccuracy: "",
              tags: [],
            })
          }
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  const renderBulkActions = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={
                selectedQuestions.size === filteredQuestions.length &&
                filteredQuestions.length > 0
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
            />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Select All
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold">
                {selectedQuestions.size} selected
              </span>
            </span>
          </label>
        </div>

        {selectedQuestions.size > 0 && (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setBulkOperation({ type: "update" });
                setShowBulkModal(true);
              }}
              className="shadow-sm"
            >
              Bulk Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setBulkOperation({ type: "duplicate" });
                setShowBulkModal(true);
              }}
              className="shadow-sm"
            >
              Duplicate
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setBulkOperation({ type: "delete" });
                setShowBulkModal(true);
              }}
              className="shadow-sm"
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuestionCard = (question: Question) => {
    const accuracy =
      question.statistics.totalAttempts > 0
        ? Math.round(
            (question.statistics.correctAttempts /
              question.statistics.totalAttempts) *
              100
          )
        : 0;

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case "Easy":
          return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
        case "Medium":
          return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
        case "Hard":
          return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
        default:
          return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
      }
    };

    return (
      <div
        key={question.id}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={selectedQuestions.has(question.id)}
            onChange={(e) =>
              handleSelectQuestion(question.id, e.target.checked)
            }
            className="mt-1.5 w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
          />

          <div className="flex-1 space-y-4">
            {/* Header with breadcrumb and tags */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span className="text-blue-600 dark:text-blue-400">
                  {question.subjectName}
                </span>
                <span className="mx-2">→</span>
                <span>{question.chapterName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${getDifficultyColor(
                    question.difficulty
                  )}`}
                >
                  {question.difficulty}
                </span>
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800">
                  {accuracy}% accuracy
                </span>
              </div>
            </div>

            {/* Question text */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed line-clamp-3">
                {question.questionText}
              </p>
            </div>

            {/* Statistics and actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {question.statistics.totalAttempts}
                  </span>
                  <span>attempts</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {Math.round(question.statistics.averageTimeSpent)}s
                  </span>
                  <span>avg time</span>
                </div>
                {question.subtopics && question.subtopics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {question.subtopics.slice(0, 2).map((subtopic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-800"
                      >
                        {subtopic}
                      </span>
                    ))}
                    {question.subtopics.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700">
                        +{question.subtopics.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingQuestion(question);
                    setShowEditModal(true);
                  }}
                  className="shadow-sm font-medium"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 shadow-sm font-medium"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Question Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and manage NEET questions with advanced filtering and
            bulk operations
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="shadow-sm"
          >
            Import Questions
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("json")}
            className="shadow-sm"
          >
            Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            className="shadow-sm"
          >
            Export CSV
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="shadow-lg"
          >
            Add Question
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {renderFilters()}
      {renderBulkActions()}

      <div className="space-y-6">
        {filteredQuestions.map(renderQuestionCard)}
      </div>

      {/* Pagination */}
      {totalCount > itemsPerPage && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="shadow-sm px-6"
            >
              ← Previous
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Page
              </span>
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-bold">
                {currentPage}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                of {Math.ceil(totalCount / itemsPerPage)}
              </span>
            </div>
            <Button
              variant="outline"
              disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="shadow-sm px-6"
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EnhancedQuestionModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        subjects={subjects}
        chapters={chapters}
        onSubmit={
          editingQuestion
            ? (data: Partial<Question>) =>
                handleUpdateQuestion(editingQuestion.id, data)
            : handleCreateQuestion
        }
        onSubjectChange={fetchChapters}
      />

      <BulkOperationModal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkOperation(null);
        }}
        operation={bulkOperation}
        selectedCount={selectedQuestions.size}
        subjects={subjects}
        chapters={chapters}
        onConfirm={handleBulkOperation}
        onUpdate={setBulkOperation}
        onSubjectChange={fetchChapters}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        subjects={subjects}
      />
    </div>
  );
};

export default AdminDashboard;
