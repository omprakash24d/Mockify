import React, { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { LoadingSpinner } from "../LoadingSpinner";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { BulkOperationModal } from "./BulkOperationModal";
import { ImportModal } from "./ImportModal";
import { QuestionModal } from "./QuestionModal";

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
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data.map((s: any) => s.name));
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  const fetchChapters = async (subject: string) => {
    if (!subject) {
      setChapters([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/chapters?subject=${subject}`);
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
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search questions..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          className="col-span-full md:col-span-2"
        />

        <select
          value={filters.subject}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              subject: e.target.value,
              chapter: "",
            }))
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          value={filters.difficulty}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <Input
          type="number"
          placeholder="Year From"
          value={filters.yearFrom}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, yearFrom: e.target.value }))
          }
        />

        <Input
          type="number"
          placeholder="Year To"
          value={filters.yearTo}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, yearTo: e.target.value }))
          }
        />

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min Accuracy %"
            value={filters.minAccuracy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minAccuracy: e.target.value }))
            }
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Max Accuracy %"
            value={filters.maxAccuracy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxAccuracy: e.target.value }))
            }
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {filteredQuestions.length} of {totalCount} questions
        </div>
        <Button
          variant="outline"
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
          Clear Filters
        </Button>
      </div>
    </div>
  );

  const renderBulkActions = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={
                selectedQuestions.size === filteredQuestions.length &&
                filteredQuestions.length > 0
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="mr-2"
            />
            Select All ({selectedQuestions.size} selected)
          </label>
        </div>

        {selectedQuestions.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBulkOperation({ type: "update" });
                setShowBulkModal(true);
              }}
            >
              Bulk Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setBulkOperation({ type: "duplicate" });
                setShowBulkModal(true);
              }}
            >
              Duplicate
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={() => {
                setBulkOperation({ type: "delete" });
                setShowBulkModal(true);
              }}
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

    return (
      <Card key={question.id} className="mb-4">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={selectedQuestions.has(question.id)}
            onChange={(e) =>
              handleSelectQuestion(question.id, e.target.checked)
            }
            className="mt-1"
          />

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-600">
                {question.subjectName} → {question.chapterName}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    question.difficulty === "Easy"
                      ? "bg-green-100 text-green-800"
                      : question.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {question.difficulty}
                </span>
                <span className="text-xs text-gray-500">
                  {accuracy}% accuracy
                </span>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-gray-900 line-clamp-3">
                {question.questionText}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {question.statistics.totalAttempts} attempts • Avg:{" "}
                {Math.round(question.statistics.averageTimeSpent)}s
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingQuestion(question);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Question Management
        </h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            Import
          </Button>
          <Button variant="outline" onClick={() => handleExport("json")}>
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport("csv")}>
            Export CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>Add Question</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {renderFilters()}
      {renderBulkActions()}

      <div className="space-y-4">
        {filteredQuestions.map(renderQuestionCard)}
      </div>

      {/* Pagination */}
      {totalCount > itemsPerPage && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <QuestionModal
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
            ? (data) => handleUpdateQuestion(editingQuestion.id, data)
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
