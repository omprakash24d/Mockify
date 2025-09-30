// Optimized NEET API service for handling large datasets efficiently
import type {
  APIResponse,
  Question,
  QuestionQueryParams,
  QuestionsResponse,
} from "../types/neet";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface OptimizedQuestionParams extends QuestionQueryParams {
  fields?: "minimal" | "basic" | "full";
  strategy?: "balanced" | "random" | "weighted";
}

export interface SampleQuestionParams {
  subjects?: string | string[];
  chapters?: string | string[];
  count?: number;
  difficulty?: string;
  strategy?: "balanced" | "random" | "weighted";
  excludeIds?: string[];
  includeTags?: string[];
}

export interface QuestionsMetadata {
  totalQuestions: number;
  subjects: string[];
  difficulties: string[];
  avgTimeSpent: number;
  subjectBreakdown: {
    subject: string;
    count: number;
    chapterCount: number;
    chapters: string[];
  }[];
  lastUpdated: string;
}

export interface FilterOptions {
  subjects: string[];
  chapters: string[];
  difficulties: string[];
  subtopics: string[];
  years: number[];
}

class OptimizedAPIService {
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseURL = `${API_BASE_URL}/optimized-questions`;
    this.cache = new Map();
  }

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${JSON.stringify(params || {})}`;
  }

  private setCache(key: string, data: any, ttl = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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
      console.error(`Optimized API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get questions metadata without loading actual questions
  async getQuestionsMetadata(): Promise<QuestionsMetadata> {
    const cacheKey = this.getCacheKey("meta");
    const cached = this.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await this.request<QuestionsMetadata>("/meta");

    if (response.success) {
      this.setCache(cacheKey, response.data, 10 * 60 * 1000); // Cache for 10 minutes
      return response.data;
    }

    throw new Error("Failed to fetch questions metadata");
  }

  // Get paginated questions with efficient loading
  async getPaginatedQuestions(
    params: OptimizedQuestionParams = {}
  ): Promise<QuestionsResponse> {
    const cacheKey = this.getCacheKey("paginated", params);
    const cached = this.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await this.request<QuestionsResponse>(
      `/paginated${queryString ? `?${queryString}` : ""}`
    );

    if (response.success) {
      this.setCache(cacheKey, response.data, 5 * 60 * 1000); // Cache for 5 minutes
      return response.data;
    }

    throw new Error("Failed to fetch paginated questions");
  }

  // Get intelligently sampled questions for test creation
  async getSampleQuestions(
    params: SampleQuestionParams = {}
  ): Promise<{ questions: Question[]; meta: any }> {
    const cacheKey = this.getCacheKey("sample", params);
    const cached = this.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(",");
          } else {
            acc[key] = String(value);
          }
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await this.request<{ questions: Question[]; meta: any }>(
      `/sample${queryString ? `?${queryString}` : ""}`
    );

    if (response.success) {
      this.setCache(cacheKey, response.data, 2 * 60 * 1000); // Cache for 2 minutes
      return response.data;
    }

    throw new Error("Failed to fetch sample questions");
  }

  // Get available filter options dynamically
  async getFilterOptions(
    subject?: string,
    chapter?: string
  ): Promise<FilterOptions> {
    const params = { subject, chapter };
    const cacheKey = this.getCacheKey("filters", params);
    const cached = this.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await this.request<FilterOptions>(
      `/filters${queryString ? `?${queryString}` : ""}`
    );

    if (response.success) {
      this.setCache(cacheKey, response.data, 15 * 60 * 1000); // Cache for 15 minutes
      return response.data;
    }

    throw new Error("Failed to fetch filter options");
  }

  // Get questions by array of IDs (for test loading)
  async getQuestionsByIds(
    ids: string[],
    fields: "minimal" | "basic" | "full" = "full"
  ): Promise<{ questions: Question[]; found: number; requested: number }> {
    if (!ids.length) {
      return { questions: [], found: 0, requested: 0 };
    }

    // Check cache first
    const cacheKey = this.getCacheKey("bulk-ids", { ids: ids.sort(), fields });
    const cached = this.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await this.request<{
      questions: Question[];
      found: number;
      requested: number;
    }>("/bulk-ids", {
      method: "POST",
      body: JSON.stringify({ ids, fields }),
    });

    if (response.success) {
      this.setCache(cacheKey, response.data, 10 * 60 * 1000); // Cache for 10 minutes
      return response.data;
    }

    throw new Error("Failed to fetch questions by IDs");
  }

  // Preload questions for better UX
  async preloadQuestionsPage(params: OptimizedQuestionParams): Promise<void> {
    try {
      // Preload current page if not cached
      const currentCacheKey = this.getCacheKey("paginated", params);
      if (!this.getCache(currentCacheKey)) {
        await this.getPaginatedQuestions(params);
      }

      // Preload next page
      const nextPageParams = { ...params, page: (params.page || 1) + 1 };
      const nextCacheKey = this.getCacheKey("paginated", nextPageParams);
      if (!this.getCache(nextCacheKey)) {
        this.getPaginatedQuestions(nextPageParams).catch(() => {
          // Silently fail preloading
        });
      }
    } catch (error) {
      // Silently fail preloading
      console.warn("Failed to preload questions:", error);
    }
  }

  // Clear cache (useful for data updates)
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for debugging
  getCacheStats(): {
    size: number;
    keys: string[];
    totalSize: number;
  } {
    const keys = Array.from(this.cache.keys());
    const totalSize = keys.reduce((size, key) => {
      const data = this.cache.get(key);
      return size + (data ? JSON.stringify(data.data).length : 0);
    }, 0);

    return {
      size: this.cache.size,
      keys,
      totalSize,
    };
  }
}

// Create singleton instance
const optimizedAPIService = new OptimizedAPIService();

export default optimizedAPIService;

// Convenience exports
export const optimizedQuestionsAPI = {
  getMetadata: () => optimizedAPIService.getQuestionsMetadata(),
  getPaginated: (params?: OptimizedQuestionParams) =>
    optimizedAPIService.getPaginatedQuestions(params),
  getSample: (params?: SampleQuestionParams) =>
    optimizedAPIService.getSampleQuestions(params),
  getFilters: (subject?: string, chapter?: string) =>
    optimizedAPIService.getFilterOptions(subject, chapter),
  getByIds: (ids: string[], fields?: "minimal" | "basic" | "full") =>
    optimizedAPIService.getQuestionsByIds(ids, fields),
  preload: (params: OptimizedQuestionParams) =>
    optimizedAPIService.preloadQuestionsPage(params),
  clearCache: (pattern?: string) => optimizedAPIService.clearCache(pattern),
  getCacheStats: () => optimizedAPIService.getCacheStats(),
};
