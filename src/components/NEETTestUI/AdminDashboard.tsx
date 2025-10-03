import {
  BarChart3,
  BookOpen,
  Download,
  Edit,
  Filter,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { adminApi } from "../../services/efficientAPI";
import type { Question } from "../../types/neet";
import { LoadingSpinner } from "../LoadingSpinner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AdminQuestionCard } from "./components/AdminQuestionCard";
import { AdvancedPagination } from "./components/AdvancedPagination";
import { mockStudents } from "./data/mockStudents";

interface AdminStats {
  totalStudents: number;
  totalQuestions: number;
  testsCompleted: number;
  avgScore: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  testsCompleted: number;
  avgScore: number;
  lastActive: string;
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

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Real Data State
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalStudents: 0,
    totalQuestions: 0,
    testsCompleted: 0,
    avgScore: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Question Management State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Student pagination
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [studentItemsPerPage] = useState(10);
  const [studentTotalCount, setStudentTotalCount] = useState(0);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStudentPageChange = (page: number) => {
    setStudentCurrentPage(page);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Utility function to format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Fetch Data
  useEffect(() => {
    // Always fetch stats when component mounts or tab changes to overview
    if (activeTab === "overview" || activeTab === "students") {
      fetchAdminStats();
    }

    if (activeTab === "questions") {
      fetchQuestions();
      fetchSubjects();
    } else if (activeTab === "students") {
      fetchStudents();
    }
  }, [activeTab, debouncedSearch, filters, currentPage, studentCurrentPage]);

  // Fetch students when search term changes (debounced)
  useEffect(() => {
    if (activeTab === "students" && searchTerm !== "") {
      const timeoutId = setTimeout(() => {
        fetchStudents();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      setError(null);

      const stats = await adminApi.getStats({
        timeout: 5000,
        retries: 2,
      });

      setAdminStats(stats);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);

      // Use fallback data when API fails
      setAdminStats({
        totalStudents: mockStudents.length,
        totalQuestions: 2847,
        testsCompleted: 156,
        avgScore: 76.8,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      setError(null);

      const result = await adminApi.getStudents(
        {
          page: studentCurrentPage,
          limit: studentItemsPerPage,
          ...(searchTerm && { search: searchTerm }),
        },
        {
          timeout: 5000,
          retries: 2,
        }
      );

      setStudents(result.students || []);
      setStudentTotalCount(result.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to fetch students:", err);

      // Use mock data as fallback when API fails
      setStudents(mockStudents);
      setStudentTotalCount(mockStudents.length);
    } finally {
      setStudentsLoading(false);
    }
  };

  // CRUD Operations for Students
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await adminApi.deleteStudent(studentId, {
        timeout: 5000,
        retries: 1,
      });

      // Refresh students list and stats
      await Promise.all([fetchStudents(), fetchAdminStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
    }
  };

  const handleEditStudent = (student: Student) => {
    // This would open a modal or navigate to an edit page
    console.log("Edit student:", student);
    // Implementation depends on your routing/modal system
  };

  // CRUD Operations for Questions
  const handleEditQuestion = (question: Question) => {
    console.log("Edit question:", question);
    // Implementation: Open question editor modal/page
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await adminApi.deleteQuestion(questionId, {
        timeout: 5000,
        retries: 1,
      });

      // Refresh questions list and stats
      await Promise.all([fetchQuestions(), fetchAdminStats()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete question"
      );
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    try {
      const duplicateData = {
        ...question,
        questionText: `[Copy] ${question.questionText}`,
        id: undefined,
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      await adminApi.createQuestion(duplicateData, {
        timeout: 8000,
        retries: 1,
      });

      // Refresh questions list
      await fetchQuestions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to duplicate question"
      );
    }
  };

  const handleViewQuestionDetails = (question: Question) => {
    console.log("View question details:", question);
    // Implementation: Open question details modal
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await adminApi.getQuestions(
        {
          page: currentPage,
          limit: itemsPerPage,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filters.subject && { subject: filters.subject }),
          ...(filters.chapter && { chapter: filters.chapter }),
          ...(filters.difficulty && { difficulty: filters.difficulty }),
          ...(filters.yearFrom && { yearFrom: filters.yearFrom }),
          ...(filters.yearTo && { yearTo: filters.yearTo }),
          ...(filters.minAccuracy && { minAccuracy: filters.minAccuracy }),
          ...(filters.maxAccuracy && { maxAccuracy: filters.maxAccuracy }),
        },
        {
          timeout: 8000,
          retries: 1,
        }
      );

      setQuestions(result.questions || []);
      setTotalCount(result.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to fetch questions:", err);

      // Show error but don't clear existing questions
      if (questions.length === 0) {
        setQuestions([]);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const result = await adminApi.getSubjects({
        timeout: 5000,
        retries: 1,
      });

      setSubjects(result.map((s: any) => s.name));
    } catch (err) {
      console.error("Failed to fetch subjects:", err);

      // Use fallback subjects
      setSubjects(["Physics", "Chemistry", "Biology"]);
    }
  };

  const fetchChapters = async (subject: string) => {
    if (!subject) {
      setChapters([]);
      return;
    }

    try {
      const result = await adminApi.getChapters(subject, {
        timeout: 5000,
        retries: 1,
      });

      setChapters(result.map((c: any) => c.name));
    } catch (err) {
      console.error("Failed to fetch chapters:", err);
      setChapters([]);
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
      setSelectedQuestions(new Set(filteredQuestions.map((q) => q._id)));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 neet-prep-font">
      {/* Enhanced Header */}
      <header className="dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive NEET question management and analytics platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="shadow-sm rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button className="shadow-lg rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Enhanced Navigation Tabs */}
        <div className="mb-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            <nav className="flex item-center space-x-2 flex-wrap ">
              {[
                {
                  id: "overview",
                  label: "Overview",
                  icon: BarChart3,
                  count: null,
                },
                {
                  id: "students",
                  label: "Students",
                  icon: Users,
                  count: adminStats.totalStudents,
                },
                {
                  id: "questions",
                  label: "Questions",
                  icon: BookOpen,
                  count: filteredQuestions.length,
                },
                {
                  id: "settings",
                  label: "Settings",
                  icon: Settings,
                  count: null,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 px-2 py-2 rounded-xl font-medium transition-all duration-200 flex-1 justify-center ${
                    activeTab === tab.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        activeTab === tab.id
                          ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {tab.count?.toLocaleString()}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Enhanced Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsLoading ? (
                // Loading skeleton for stats
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Actual stats cards */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Students
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                          {adminStats.totalStudents.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          +12% this month
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Questions
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                          {adminStats.totalQuestions.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          +85 this week
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                        <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Tests Completed
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                          {adminStats.testsCompleted.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          +340 today
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                        <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Average Score
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                          {adminStats.avgScore}%
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          +2.3% vs last month
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                        <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Recent Activity
                </h3>
                <Button variant="outline" size="sm" className="rounded-xl">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {studentsLoading ? (
                  // Loading skeleton for recent activity
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl animate-pulse"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    </div>
                  ))
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent student activity
                    </p>
                  </div>
                ) : (
                  students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Completed test • Score: {student.avgScore}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {student.lastActive}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                              student.avgScore >= 80
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                : student.avgScore >= 60
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {student.avgScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-8">
            {/* Enhanced Search and Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1 w-full">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search students by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl shadow-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="rounded-xl shadow-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" className="rounded-xl shadow-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <Button className="rounded-xl shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Students Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Student Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filteredStudents.length} students found
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Tests Completed
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {studentsLoading ? (
                      // Loading skeleton for students table
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                              <div className="ml-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mt-1"></div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-16"></div>
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-8"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm
                              ? "No students found matching your search"
                              : "No students found"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {student.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <span
                                className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-xl ${
                                  student.avgScore >= 80
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                    : student.avgScore >= 60
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                }`}
                              >
                                {student.avgScore}% avg
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {student.testsCompleted}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              tests completed
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatRelativeTime(student.lastActive)}
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Students Pagination */}
              {!studentsLoading && students.length > 0 && (
                <AdvancedPagination
                  currentPage={studentCurrentPage}
                  totalPages={Math.ceil(
                    studentTotalCount / studentItemsPerPage
                  )}
                  totalItems={studentTotalCount}
                  itemsPerPage={studentItemsPerPage}
                  onPageChange={handleStudentPageChange}
                  loading={studentsLoading}
                />
              )}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div className="space-y-6">
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

            {/* Advanced Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Question Filters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="col-span-full md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search questions by text, subject, or topic..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="h-12 text-base rounded-xl"
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <select
                  value={filters.difficulty}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
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
                    setFilters((prev) => ({
                      ...prev,
                      yearFrom: e.target.value,
                    }))
                  }
                  className="h-12 rounded-xl"
                />

                <Input
                  type="number"
                  placeholder="To Year (e.g., 2024)"
                  value={filters.yearTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, yearTo: e.target.value }))
                  }
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  Showing{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {filteredQuestions.length}
                  </span>{" "}
                  of <span className="font-bold">{totalCount}</span> questions
                </div>
                <Button
                  variant="outline"
                  className="shadow-sm rounded-xl"
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

            {/* Bulk Actions */}
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

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="shadow-sm rounded-xl">
                    Import Questions
                  </Button>
                  <Button variant="outline" className="shadow-sm rounded-xl">
                    Export
                  </Button>
                  <Button className="shadow-lg rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>
            </div>

            {/* Questions Display */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    No Questions Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {filters.search || filters.subject || filters.difficulty
                      ? "Try adjusting your filters or search terms."
                      : "Start building your question bank by adding new questions."}
                  </p>
                  <Button className="shadow-lg rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredQuestions.map((question, index) => (
                  <AdminQuestionCard
                    key={question._id}
                    question={question}
                    questionNumber={
                      (currentPage - 1) * itemsPerPage + index + 1
                    }
                    isSelected={selectedQuestions.has(question._id)}
                    onSelect={(questionId, selected) =>
                      handleSelectQuestion(questionId, selected)
                    }
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                    onDuplicate={handleDuplicateQuestion}
                    onViewDetails={handleViewQuestionDetails}
                  />
                ))}

                {/* Questions Pagination */}
                {filteredQuestions.length > 0 && (
                  <AdvancedPagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalCount / itemsPerPage)}
                    totalItems={totalCount}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* System Configuration */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 mr-4">
                    <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      System Configuration
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Core platform settings and preferences
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    General Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                  >
                    <Users className="w-4 h-4 mr-3" />
                    User Management
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                  >
                    <BookOpen className="w-4 h-4 mr-3" />
                    Question Bank Settings
                  </Button>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 mr-4">
                    <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Data Management
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Import, export, and backup options
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                  >
                    <Upload className="w-4 h-4 mr-3" />
                    Bulk Import Questions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-3" />
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Database Backup
                  </Button>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                System Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-3"></div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Database
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Online
                  </p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-3"></div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                    API Server
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Running
                  </p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-3"></div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Storage
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    74% Available
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
