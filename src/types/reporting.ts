export interface QuestionReport {
  _id?: string;
  questionId: string | null;
  reportType:
    | "wrong_answer"
    | "unclear_question"
    | "multiple_correct"
    | "typo"
    | "other";
  description: string;
  reportedBy?: string; // User ID or anonymous
  reportedAt?: Date; // For backwards compatibility
  createdAt?: Date; // Actual field from MongoDB timestamps
  updatedAt?: Date; // From MongoDB timestamps
  timeAgo?: string; // Virtual field from backend
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  adminNotes?: string;
  resolvedBy?: string; // Admin ID
  resolvedAt?: Date;
  priority: "low" | "medium" | "high" | "critical";
  isActive?: boolean;
  tags?: string[];

  // Question snapshot for reference
  questionSnapshot: {
    questionText: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    correctAnswer: string;
    subjectName: string;
    chapterName: string;
  };
}

export interface ReportSummary {
  total: number;
  pending: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface ReportingAPI {
  submitReport: (
    report: Omit<
      QuestionReport,
      | "_id"
      | "reportedAt"
      | "createdAt"
      | "updatedAt"
      | "timeAgo"
      | "status"
      | "isActive"
      | "tags"
    >
  ) => Promise<{ success: boolean; reportId?: string; error?: string }>;
  getReports: (filters?: {
    status?: string;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) => Promise<{
    success: boolean;
    data?: { reports: QuestionReport[]; total: number; pagination: any };
    error?: string;
  }>;
  updateReportStatus: (
    reportId: string,
    status: string,
    adminNotes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  getReportSummary: () => Promise<{
    success: boolean;
    data?: ReportSummary;
    error?: string;
  }>;
  getQuestionReports: (
    questionId: string
  ) => Promise<{ success: boolean; data?: QuestionReport[]; error?: string }>;
}
