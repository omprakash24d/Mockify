// Backend API service for NEET questions
import type {
  APIResponse,
  Chapter,
  Question,
  QuestionQueryParams,
  QuestionsResponse,
  RandomQuestionParams,
  Subject,
  SubjectOverview,
  SubjectProgress,
} from "../types/neet";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Questions API
  async getQuestions(
    params: QuestionQueryParams = {}
  ): Promise<APIResponse<QuestionsResponse>> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          const stringValue = String(value).trim();
          if (stringValue) {
            acc[key] = stringValue;
          }
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return this.request(`/questions${queryString ? `?${queryString}` : ""}`);
  }

  async getQuestion(id: string): Promise<APIResponse<Question>> {
    return this.request(`/questions/${id}`);
  }

  async getRandomQuestions(
    params: RandomQuestionParams = {}
  ): Promise<APIResponse<Question[]>> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          const stringValue = String(value).trim();
          if (stringValue) {
            acc[key] = stringValue;
          }
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return this.request(
      `/questions/random${queryString ? `?${queryString}` : ""}`
    );
  }

  async searchQuestions(
    searchTerm: string,
    params: QuestionQueryParams = {}
  ): Promise<APIResponse<QuestionsResponse>> {
    const queryParams = { q: searchTerm, ...params };
    const queryString = new URLSearchParams(
      Object.entries(queryParams).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          const stringValue = String(value).trim();
          if (stringValue) {
            acc[key] = stringValue;
          }
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return this.request(`/questions/search?${queryString}`);
  }

  async recordQuestionAttempt(
    questionId: string,
    isCorrect: boolean,
    timeSpent: number = 0
  ): Promise<APIResponse<any>> {
    return this.request(`/questions/${questionId}/attempt`, {
      method: "POST",
      body: JSON.stringify({ isCorrect, timeSpent }),
    });
  }

  // Subjects API
  async getSubjects(): Promise<APIResponse<Subject[]>> {
    return this.request("/subjects");
  }

  async getSubject(subject: string): Promise<APIResponse<Subject>> {
    return this.request(`/subjects/${encodeURIComponent(subject)}`);
  }

  async getSubjectOverview(
    subject: string
  ): Promise<APIResponse<SubjectOverview>> {
    return this.request(`/subjects/${encodeURIComponent(subject)}/overview`);
  }

  async getSubjectProgress(
    subject: string
  ): Promise<APIResponse<SubjectProgress>> {
    return this.request(`/subjects/${encodeURIComponent(subject)}/progress`);
  }

  // Chapters API
  async getChapters(subject: string): Promise<APIResponse<Chapter[]>> {
    return this.request(`/chapters/${encodeURIComponent(subject)}`);
  }

  async getChapter(
    subject: string,
    chapter: string
  ): Promise<APIResponse<Chapter>> {
    return this.request(
      `/chapters/${encodeURIComponent(subject)}/${encodeURIComponent(chapter)}`
    );
  }

  async getChapterOverview(
    subject: string,
    chapter: string
  ): Promise<APIResponse<any>> {
    return this.request(
      `/chapters/${encodeURIComponent(subject)}/${encodeURIComponent(
        chapter
      )}/overview`
    );
  }

  async getChapterSubtopics(
    subject: string,
    chapter: string
  ): Promise<APIResponse<string[]>> {
    return this.request(
      `/chapters/${encodeURIComponent(subject)}/${encodeURIComponent(
        chapter
      )}/subtopics`
    );
  }

  // Analytics API
  async getOverviewAnalytics(): Promise<APIResponse<any>> {
    return this.request("/analytics/overview");
  }

  async getSubjectAnalytics(): Promise<APIResponse<any>> {
    return this.request("/analytics/subjects");
  }

  async getPopularQuestions(
    limit: number = 10
  ): Promise<APIResponse<Question[]>> {
    return this.request(`/analytics/popular-questions?limit=${limit}`);
  }

  async getDifficultQuestions(
    limit: number = 10,
    minAttempts: number = 5
  ): Promise<APIResponse<Question[]>> {
    return this.request(
      `/analytics/difficult-questions?limit=${limit}&minAttempts=${minAttempts}`
    );
  }

  async getPerformanceTrends(days: number = 30): Promise<APIResponse<any>> {
    return this.request(`/analytics/performance-trends?days=${days}`);
  }

  async getCacheStats(): Promise<APIResponse<any>> {
    return this.request("/analytics/cache-stats");
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;

// Named exports for specific services
export const questionsAPI = {
  getAll: (params?: QuestionQueryParams) => apiService.getQuestions(params),
  getById: (id: string) => apiService.getQuestion(id),
  getRandom: (params?: RandomQuestionParams) =>
    apiService.getRandomQuestions(params),
  search: (term: string, params?: QuestionQueryParams) =>
    apiService.searchQuestions(term, params),
  recordAttempt: (id: string, isCorrect: boolean, timeSpent?: number) =>
    apiService.recordQuestionAttempt(id, isCorrect, timeSpent),
};

export const subjectsAPI = {
  getAll: () => apiService.getSubjects(),
  getById: (subject: string) => apiService.getSubject(subject),
  getOverview: (subject: string) => apiService.getSubjectOverview(subject),
  getProgress: (subject: string) => apiService.getSubjectProgress(subject),
};

export const chaptersAPI = {
  getBySubject: (subject: string) => apiService.getChapters(subject),
  getById: (subject: string, chapter: string) =>
    apiService.getChapter(subject, chapter),
  getOverview: (subject: string, chapter: string) =>
    apiService.getChapterOverview(subject, chapter),
  getSubtopics: (subject: string, chapter: string) =>
    apiService.getChapterSubtopics(subject, chapter),
};

export const analyticsAPI = {
  getOverview: () => apiService.getOverviewAnalytics(),
  getSubjects: () => apiService.getSubjectAnalytics(),
  getPopularQuestions: (limit?: number) =>
    apiService.getPopularQuestions(limit),
  getDifficultQuestions: (limit?: number, minAttempts?: number) =>
    apiService.getDifficultQuestions(limit, minAttempts),
  getTrends: (days?: number) => apiService.getPerformanceTrends(days),
  getCacheStats: () => apiService.getCacheStats(),
};
