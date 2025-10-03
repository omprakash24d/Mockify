interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  abortSignal?: AbortSignal;
}

class EfficientApiService {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private pendingRequests = new Map<string, Promise<any>>();
  private baseUrl: string;

  constructor(
    baseUrl: string = import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:5000/api"
  ) {
    this.baseUrl = baseUrl;
  }

  private getCacheKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : "";
    return `${url}${paramString}`;
  }

  private isValidCache(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    return now - cached.timestamp < cached.ttl;
  }

  private setCache(
    cacheKey: string,
    data: any,
    ttl: number = 5 * 60 * 1000
  ): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    requestOptions: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = 5000,
      retries = 2,
      retryDelay = 1000,
      abortSignal,
    } = requestOptions;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Use external abort signal if provided
        if (abortSignal?.aborted) {
          throw new Error("Request aborted");
        }

        const response = await fetch(`${this.baseUrl}${url}`, {
          ...options,
          signal: abortSignal || controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse<T> = await response.json();

        if (!data.success) {
          throw new Error(data.error || "API request failed");
        }

        return data.data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort errors
        if (lastError.name === "AbortError" || abortSignal?.aborted) {
          throw lastError;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    throw lastError!;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: RequestOptions & { useCache?: boolean; cacheTtl?: number } = {}
  ): Promise<T> {
    const {
      useCache = true,
      cacheTtl = 5 * 60 * 1000,
      ...requestOptions
    } = options;

    // Build URL with params
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    const cacheKey = this.getCacheKey(url);

    // Check cache first
    if (useCache && this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Make new request
    const requestPromise = this.makeRequest<T>(
      url,
      { method: "GET" },
      requestOptions
    )
      .then((data) => {
        if (useCache) {
          this.setCache(cacheKey, data, cacheTtl);
        }
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      options
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      options
    );
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "DELETE" }, options);
  }

  // Clear cache for specific pattern
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

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
export const apiService = new EfficientApiService();

// Specific API methods for the admin dashboard
export const adminApi = {
  // Get admin statistics
  getStats: (options?: RequestOptions) =>
    apiService.get<{
      totalStudents: number;
      totalQuestions: number;
      testsCompleted: number;
      avgScore: number;
    }>("/admin/stats", undefined, { ...options, cacheTtl: 2 * 60 * 1000 }),

  // Get students with pagination and search
  getStudents: (
    params: { page?: number; limit?: number; search?: string } = {},
    options?: RequestOptions
  ) =>
    apiService.get<{
      students: Array<{
        id: string;
        name: string;
        email: string;
        testsCompleted: number;
        avgScore: number;
        lastActive: string;
      }>;
      pagination: {
        current: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>("/admin/students", params, { ...options, useCache: false }),

  // Delete student
  deleteStudent: (id: string, options?: RequestOptions) =>
    apiService.delete<{ message: string; deletedId: string }>(
      `/admin/students/${id}`,
      options
    ),

  // Get questions with filters
  getQuestions: (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      subject?: string;
      chapter?: string;
      difficulty?: string;
      yearFrom?: string;
      yearTo?: string;
      minAccuracy?: string;
      maxAccuracy?: string;
    } = {},
    options?: RequestOptions
  ) =>
    apiService.get<{
      questions: Array<any>;
      pagination: {
        current: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>("/questions", params, options),

  // Get subjects
  getSubjects: (options?: RequestOptions) =>
    apiService.get<Array<{ name: string }>>("/subjects", undefined, {
      ...options,
      cacheTtl: 10 * 60 * 1000,
    }),

  // Get chapters for subject
  getChapters: (subject: string, options?: RequestOptions) =>
    apiService.get<Array<{ name: string }>>(
      `/chapters/${encodeURIComponent(subject)}`,
      undefined,
      options
    ),

  // Create question
  createQuestion: (data: any, options?: RequestOptions) =>
    apiService.post<any>("/questions", data, options),

  // Update question
  updateQuestion: (id: string, data: any, options?: RequestOptions) =>
    apiService.put<any>(`/questions/${id}`, data, options),

  // Delete question
  deleteQuestion: (id: string, options?: RequestOptions) =>
    apiService.delete<{ message: string }>(`/questions/${id}`, options),
};

export default apiService;
