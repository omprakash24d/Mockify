import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  RefreshCw,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  PRIORITY_COLORS,
  REPORT_TYPES,
  STATUS_COLORS,
} from "../../constants/reporting";
import { reportingService } from "../../services/reportingService";
import type { Question } from "../../types/neet";
import type { QuestionReport, ReportSummary } from "../../types/reporting";
import { QuestionModal } from "../NEETTestUI/components/QuestionModal";

export const AdminReportsDashboard: React.FC = () => {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<QuestionReport | null>(
    null
  );
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Question Modal State for editing reported questions
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [questionModalMode, setQuestionModalMode] = useState<
    "view" | "edit" | "create"
  >("view");

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const result = await reportingService.getReports({
        ...filters,
        page,
        limit: 20,
      });

      if (result.success && result.data) {
        setReports(result.data.reports);
        setTotalPages(result.data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        setError(result.error || "Failed to fetch reports");
      }
    } catch (err) {
      setError("An error occurred while fetching reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const result = await reportingService.getReportSummary();
      if (result.success && result.data) {
        setSummary(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchSummary();
  }, [filters]);

  const handleStatusUpdate = async (
    reportId: string,
    newStatus: string,
    adminNotes?: string
  ) => {
    try {
      const result = await reportingService.updateReportStatus(
        reportId,
        newStatus,
        adminNotes
      );
      if (result.success) {
        // Refresh the reports list
        await fetchReports(currentPage);
        await fetchSummary();
        setSelectedReport(null);
      } else {
        setError(result.error || "Failed to update report status");
      }
    } catch (err) {
      setError("An error occurred while updating the report");
    }
  };

  const handleEditQuestion = (report: QuestionReport) => {
    // Convert QuestionReport snapshot to Question format
    const questionData: Question = {
      _id: report.questionId || "",
      id: report.questionId || undefined,
      questionText: report.questionSnapshot.questionText,
      subjectName: report.questionSnapshot.subjectName,
      chapterName: report.questionSnapshot.chapterName,
      options: report.questionSnapshot.options.map((opt: any) => {
        // Correct logic: correctAnswer is the text of the correct option (virtual field)
        const isCorrect =
          opt.isCorrect || report.questionSnapshot.correctAnswer === opt.text;

        return {
          text: opt.text,
          isCorrect: isCorrect,
        };
      }),
      difficulty: "medium" as any,
      yearAppeared: 2024,
      explanation: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statistics: {
        totalAttempts: 0,
        correctAttempts: 0,
        averageTimeSpent: 0,
      },
      correctAnswer: report.questionSnapshot.correctAnswer,
      successRate: 0,
    };

    setSelectedQuestion(questionData);
    setQuestionModalMode("edit");
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (questionData: any) => {
    try {
      // Here you would implement the save logic
      // This should connect to your existing question update API
      console.log("Saving question:", questionData);

      // Close the modal after saving
      setQuestionModalOpen(false);
      setSelectedQuestion(null);

      // Refresh reports to reflect any changes
      await fetchReports(currentPage);
    } catch (err) {
      console.error("Failed to save question:", err);
      setError("Failed to save question changes");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Question Reports Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and review reported question issues
            </p>
          </div>
          <button
            onClick={() => {
              fetchReports(currentPage);
              fetchSummary();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Reports
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {summary.total}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {summary.pending}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Resolved
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.resolved}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Dismissed
                  </p>
                  <p className="text-2xl font-bold text-gray-600">
                    {summary.dismissed}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filters:
              </span>
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All Types</option>
              <option value="wrong_answer">Wrong Answer</option>
              <option value="multiple_correct">Multiple Correct</option>
              <option value="unclear_question">Unclear Question</option>
              <option value="typo">Typo/Grammar</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading reports...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No reports found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Report Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Question Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.map((report, index) => (
                    <tr
                      key={`report-${
                        report._id || report.questionId || index
                      }-${report.reportType}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                REPORT_TYPES[
                                  report.reportType as keyof typeof REPORT_TYPES
                                ]?.color || "text-gray-600 bg-gray-50"
                              }`}
                            >
                              {REPORT_TYPES[
                                report.reportType as keyof typeof REPORT_TYPES
                              ]?.label || report.reportType}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {report.timeAgo ||
                                formatTimeAgo(
                                  report.createdAt?.toString() ||
                                    new Date().toISOString()
                                )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                            {report.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            By: {report.reportedBy}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {report.questionSnapshot.subjectName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {report.questionSnapshot.chapterName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {report.questionSnapshot.questionText.substring(
                              0,
                              100
                            )}
                            ...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            PRIORITY_COLORS[
                              report.priority as keyof typeof PRIORITY_COLORS
                            ]
                          }`}
                        >
                          {report.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            STATUS_COLORS[
                              report.status as keyof typeof STATUS_COLORS
                            ]
                          }`}
                        >
                          {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditQuestion(report)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit Question"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {report.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(report._id!, "reviewing")
                                }
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                Review
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(report._id!, "resolved")
                                }
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              >
                                Resolve
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(report._id!, "dismissed")
                                }
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => fetchReports(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300"
              >
                Previous
              </button>

              {/* Show page 1 if we're far from it */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => fetchReports(1)}
                    className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                </>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(
                  1,
                  Math.min(currentPage - 2, totalPages - 4)
                );
                const page = startPage + i;

                if (page > totalPages) return null;

                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => fetchReports(page)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Show last page if we're far from it */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => fetchReports(totalPages)}
                    className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => fetchReports(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Question Edit Modal */}
      <QuestionModal
        isOpen={questionModalOpen}
        question={selectedQuestion}
        mode={questionModalMode}
        onClose={() => {
          setQuestionModalOpen(false);
          setSelectedQuestion(null);
        }}
        onSave={handleSaveQuestion}
      />
    </div>
  );
};

// Report Detail Modal Component
interface ReportDetailModalProps {
  report: QuestionReport;
  onClose: () => void;
  onStatusUpdate: (
    reportId: string,
    status: string,
    adminNotes?: string
  ) => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onStatusUpdate,
}) => {
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Report Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Report Info */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Report Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Type:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        REPORT_TYPES[
                          report.reportType as keyof typeof REPORT_TYPES
                        ]?.color
                      }`}
                    >
                      {
                        REPORT_TYPES[
                          report.reportType as keyof typeof REPORT_TYPES
                        ]?.label
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Priority:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        PRIORITY_COLORS[
                          report.priority as keyof typeof PRIORITY_COLORS
                        ]
                      }`}
                    >
                      {report.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        STATUS_COLORS[
                          report.status as keyof typeof STATUS_COLORS
                        ]
                      }`}
                    >
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Reported by:
                    </span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                      {report.reportedBy}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Description:
                  </span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Question Snapshot */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Question Snapshot
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Subject:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    {report.questionSnapshot.subjectName}
                  </span>
                  <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                    Chapter:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    {report.questionSnapshot.chapterName}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Question:
                  </span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {report.questionSnapshot.questionText}
                  </p>
                </div>
                <div className="mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Options:
                  </span>
                  <div className="mt-2 space-y-1">
                    {report.questionSnapshot.options.map((option, index) => {
                      // Correct logic: correctAnswer is the text of the correct option (virtual field)
                      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D for display
                      const isCorrectOption =
                        option.isCorrect ||
                        report.questionSnapshot.correctAnswer === option.text;

                      return (
                        <div
                          key={`option-${
                            report._id || report.questionId || "unknown"
                          }-${index}-${option.text.substring(0, 10)}`}
                          className={`p-2 rounded text-sm ${
                            isCorrectOption
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          <span className="font-medium">({optionLetter})</span>{" "}
                          {option.text}
                          {isCorrectOption && (
                            <span className="ml-2 text-xs font-medium">
                              (Correct)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Admin Notes
              </h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this report..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                Close
              </button>
              {report.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      onStatusUpdate(report._id!, "reviewing", adminNotes)
                    }
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                  >
                    Mark as Reviewing
                  </button>
                  <button
                    onClick={() =>
                      onStatusUpdate(report._id!, "resolved", adminNotes)
                    }
                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() =>
                      onStatusUpdate(report._id!, "dismissed", adminNotes)
                    }
                    className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
