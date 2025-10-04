import type {
  QuestionReport,
  ReportSummary,
  ReportingAPI,
} from "../types/reporting";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ReportingService implements ReportingAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : typeof result.error === "object"
            ? JSON.stringify(result.error)
            : `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      return result;
    } catch (error) {
      console.error("Reporting API Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : typeof error === "object"
          ? JSON.stringify(error)
          : "Unknown error occurred";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async submitReport(
    report: Omit<QuestionReport, "_id" | "reportedAt" | "status">
  ): Promise<{ success: boolean; reportId?: string; error?: string }> {
    const result = await this.makeRequest<{
      reportId: string;
      message: string;
    }>("/", {
      method: "POST",
      body: JSON.stringify(report),
    });

    return {
      success: result.success,
      reportId: result.data?.reportId,
      error: result.error,
    };
  }

  async getReports(filters?: {
    status?: string;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: { reports: QuestionReport[]; total: number; pagination: any };
    error?: string;
  }> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/?${queryString}` : "/";

    return this.makeRequest<{
      reports: QuestionReport[];
      total: number;
      pagination: any;
    }>(endpoint);
  }

  async updateReportStatus(
    reportId: string,
    status: string,
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const body: any = { status };
    if (adminNotes) {
      body.adminNotes = adminNotes;
    }

    const result = await this.makeRequest(`/${reportId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return {
      success: result.success,
      error: result.error,
    };
  }

  async getReportSummary(): Promise<{
    success: boolean;
    data?: ReportSummary;
    error?: string;
  }> {
    return this.makeRequest<ReportSummary>("/summary");
  }

  async getQuestionReports(questionId: string): Promise<{
    success: boolean;
    data?: QuestionReport[];
    error?: string;
  }> {
    return this.makeRequest<QuestionReport[]>(`/question/${questionId}`);
  }

  async getPendingReports(limit = 50): Promise<{
    success: boolean;
    data?: QuestionReport[];
    error?: string;
  }> {
    return this.makeRequest<QuestionReport[]>(`/pending?limit=${limit}`);
  }

  async bulkUpdateReports(
    reportIds: string[],
    status: string,
    adminNotes?: string
  ): Promise<{
    success: boolean;
    data?: { updatedCount: number; message: string };
    error?: string;
  }> {
    const body: any = { reportIds, status };
    if (adminNotes) {
      body.adminNotes = adminNotes;
    }

    return this.makeRequest<{ updatedCount: number; message: string }>(
      "/bulk",
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  }
}

export const reportingService = new ReportingService();
export default reportingService;
