import {
  BarChart3,
  Book,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { LoadingSpinner } from "../LoadingSpinner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import ModernQuestionModal from "./ModernQuestionModal";

interface Question {
  _id: string;
  id?: string;
  questionText: string;
  subjectName: string;
  chapterName: string;
  difficulty: "Easy" | "Medium" | "Hard";
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subtopics?: string[];
  yearAppeared?: number;
  statistics?: {
    totalAttempts: number;
    correctAttempts: number;
    averageTimeSpent: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ModernAdminDashboardProps {
  className?: string;
}

const ModernAdminDashboard: React.FC<ModernAdminDashboardProps> = ({
  className,
}) => {
  // State Management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    subject: "",
    chapter: "",
    difficulty: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // API Functions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.chapter && { chapter: filters.chapter }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
      });

      const response = await fetch(`/api/questions?${params}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data.questions || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalItems(data.data.pagination?.totalItems || 0);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filters]);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch("/api/subjects");
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data.map((s: any) => s.name || s));
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  }, []);

  const fetchChapters = useCallback(async (subject: string) => {
    if (!subject) {
      setChapters([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/chapters/${encodeURIComponent(subject)}`
      );
      const data = await response.json();
      if (data.success) {
        setChapters(data.data.map((c: any) => c.name));
      }
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      setChapters([]);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (filters.subject) {
      fetchChapters(filters.subject);
    } else {
      setChapters([]);
    }
  }, [filters.subject, fetchChapters]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuestions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "subject" && { chapter: "" }), // Reset chapter when subject changes
    }));
    setCurrentPage(1);
  };

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((q) => q._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;

    if (!confirm(`Delete ${selectedQuestions.size} questions?`)) return;

    try {
      setLoading(true);
      const response = await fetch("/api/admin/questions/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedQuestions) }),
      });

      if (response.ok) {
        setSelectedQuestions(new Set());
        fetchQuestions();
      }
    } catch (error) {
      console.error("Failed to delete questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleView = (question: Question) => {
    setSelectedQuestion(question);
    // Open in view-only mode
  };

  const handleDuplicate = async (question: Question) => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/questions/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question._id }),
      });

      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error("Failed to duplicate question:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit question handler
  const handleSubmitQuestion = async (questionData: Partial<Question>) => {
    try {
      setLoading(true);

      const method = selectedQuestion ? "PUT" : "POST";
      const url = selectedQuestion
        ? `/api/admin/questions/${selectedQuestion._id}`
        : "/api/admin/questions";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        await fetchQuestions();
        setIsModalOpen(false);
        setSelectedQuestion(null);
      } else {
        throw new Error("Failed to save question");
      }
    } catch (error) {
      console.error("Failed to save question:", error);
      throw error; // Re-throw so modal can handle the error
    } finally {
      setLoading(false);
    }
  };

  // Subject change handler
  const handleSubjectChange = async (subject: string) => {
    try {
      const response = await fetch(`/api/chapters/${subject}`);
      if (response.ok) {
        const data = await response.json();
        setChapters(data.chapters || []);
      }
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      setChapters([]);
    }
  };

  // Quick Stats Component
  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Questions
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalItems}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Book className="w-8 h-8 text-green-600 dark:text-green-400" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Subjects
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {subjects.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Selected
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedQuestions.size}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <BarChart3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Current Page
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentPage}/{totalPages}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Search & Filter Bar
  const SearchAndFilters = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              showFilters && "rotate-180"
            )}
          />
        </Button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange("subject", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chapter
            </label>
            <select
              value={filters.chapter}
              onChange={(e) => handleFilterChange("chapter", e.target.value)}
              disabled={!filters.subject}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            >
              <option value="">All Chapters</option>
              {chapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  // Action Bar
  const ActionBar = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => {
            setSelectedQuestion(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Button>

        {selectedQuestions.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedQuestions.size})
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                /* Handle bulk export */
              }}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
          size="sm"
        >
          {viewMode === "table" ? "Card View" : "Table View"}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            /* Handle import */
          }}
          className="flex items-center gap-2"
          size="sm"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>
      </div>
    </div>
  );

  // Table View
  const TableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedQuestions.size === questions.length &&
                    questions.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Question
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Subject/Chapter
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {questions.map((question) => (
              <tr
                key={question._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(question._id)}
                    onChange={() => handleQuestionSelect(question._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                      {question.questionText}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {question.options?.length || 0} options
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {question.subjectName}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {question.chapterName}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      question.difficulty === "Easy" &&
                        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                      question.difficulty === "Medium" &&
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
                      question.difficulty === "Hard" &&
                        "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    )}
                  >
                    {question.difficulty}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {question.statistics ? (
                    <div>
                      <p>{question.statistics.totalAttempts} attempts</p>
                      <p>{question.statistics.correctAttempts} correct</p>
                    </div>
                  ) : (
                    <p>No data</p>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(question)}
                      className="p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(question)}
                      className="p-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(question)}
                      className="p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        /* More actions */
                      }}
                      className="p-1"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {questions.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No questions found
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );

  // Pagination Component
  const Pagination = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
      <div className="flex justify-between items-center w-full">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          results
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(1, currentPage - 2);
              if (page > totalPages) return null;

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || loading}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Question Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and organize your question database
          </p>
        </div>
      </div>

      <QuickStats />
      <SearchAndFilters />
      <ActionBar />
      <TableView />
      <Pagination />

      {/* Question Modal */}
      <ModernQuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuestion(null);
        }}
        question={selectedQuestion}
        subjects={subjects}
        chapters={chapters}
        onSubmit={handleSubmitQuestion}
        onSubjectChange={handleSubjectChange}
      />
    </div>
  );
};

export default ModernAdminDashboard;
