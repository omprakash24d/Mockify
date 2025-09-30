import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FilterOptions,
  OptimizedQuestionParams,
  QuestionsMetadata,
  SampleQuestionParams,
} from "../../../services/optimizedNeetAPI";
import { optimizedQuestionsAPI } from "../../../services/optimizedNeetAPI";
import type { Question, Pagination } from "../../../types/neet";

interface UseOptimizedQuestionsState {
  questions: Question[];
  metadata: QuestionsMetadata | null;
  filters: FilterOptions | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

interface UseOptimizedQuestionsReturn extends UseOptimizedQuestionsState {
  loadQuestions: (params?: OptimizedQuestionParams) => Promise<void>;
  loadSampleQuestions: (params?: SampleQuestionParams) => Promise<Question[]>;
  loadMetadata: () => Promise<void>;
  loadFilters: (subject?: string, chapter?: string) => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  clearCache: () => void;
  preloadNext: () => void;
  refresh: () => Promise<void>;
}

export const useOptimizedQuestions = (
  initialParams: OptimizedQuestionParams = {}
): UseOptimizedQuestionsReturn => {
  const [state, setState] = useState<UseOptimizedQuestionsState>({
    questions: [],
    metadata: null,
    filters: null,
    loading: false,
    error: null,
    pagination: null,
  });

  const currentParamsRef = useRef<OptimizedQuestionParams>(initialParams);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Load paginated questions
  const loadQuestions = useCallback(
    async (params: OptimizedQuestionParams = {}) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const mergedParams = { ...currentParamsRef.current, ...params };
      currentParamsRef.current = mergedParams;

      setLoading(true);
      setError(null);

      try {
        const response = await optimizedQuestionsAPI.getPaginated(mergedParams);

        setState((prev) => ({
          ...prev,
          questions: response.questions,
          pagination: response.pagination,
          loading: false,
        }));

        // Preload next page for better UX
        optimizedQuestionsAPI.preload({
          ...mergedParams,
          page: (mergedParams.page || 1) + 1,
        });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to load questions:", error);
          setError(error.message || "Failed to load questions");
          setLoading(false);
        }
      }
    },
    [setLoading, setError]
  );

  // Load sample questions for test creation
  const loadSampleQuestions = useCallback(
    async (params: SampleQuestionParams = {}): Promise<Question[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await optimizedQuestionsAPI.getSample(params);
        return response.questions;
      } catch (error: any) {
        console.error("Failed to load sample questions:", error);
        setError(error.message || "Failed to load sample questions");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Load metadata
  const loadMetadata = useCallback(async () => {
    try {
      const metadata = await optimizedQuestionsAPI.getMetadata();
      setState((prev) => ({ ...prev, metadata }));
    } catch (error: any) {
      console.error("Failed to load metadata:", error);
      setError(error.message || "Failed to load metadata");
    }
  }, [setError]);

  // Load filter options
  const loadFilters = useCallback(
    async (subject?: string, chapter?: string) => {
      try {
        const filters = await optimizedQuestionsAPI.getFilters(
          subject,
          chapter
        );
        setState((prev) => ({ ...prev, filters }));
      } catch (error: any) {
        console.error("Failed to load filters:", error);
        setError(error.message || "Failed to load filters");
      }
    },
    [setError]
  );

  // Pagination controls
  const nextPage = useCallback(() => {
    if (state.pagination?.hasNext) {
      const nextPageNum = (currentParamsRef.current.page || 1) + 1;
      loadQuestions({ ...currentParamsRef.current, page: nextPageNum });
    }
  }, [state.pagination?.hasNext, loadQuestions]);

  const prevPage = useCallback(() => {
    if (state.pagination?.hasPrev) {
      const prevPageNum = Math.max((currentParamsRef.current.page || 1) - 1, 1);
      loadQuestions({ ...currentParamsRef.current, page: prevPageNum });
    }
  }, [state.pagination?.hasPrev, loadQuestions]);

  const goToPage = useCallback(
    (page: number) => {
      if (
        page >= 1 &&
        (!state.pagination || page <= state.pagination.totalPages)
      ) {
        loadQuestions({ ...currentParamsRef.current, page });
      }
    },
    [state.pagination, loadQuestions]
  );

  // Preload next page
  const preloadNext = useCallback(() => {
    if (state.pagination?.hasNext) {
      optimizedQuestionsAPI.preload({
        ...currentParamsRef.current,
        page: (currentParamsRef.current.page || 1) + 1,
      });
    }
  }, [state.pagination?.hasNext]);

  // Clear cache
  const clearCache = useCallback(() => {
    optimizedQuestionsAPI.clearCache();
  }, []);

  // Refresh current data
  const refresh = useCallback(async () => {
    clearCache();
    await Promise.all([
      loadQuestions(currentParamsRef.current),
      loadMetadata(),
      loadFilters(),
    ]);
  }, [loadQuestions, loadMetadata, loadFilters, clearCache]);

  // Load initial data
  useEffect(() => {
    loadMetadata();
    loadFilters();
    if (Object.keys(initialParams).length > 0) {
      loadQuestions(initialParams);
    }
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    loadQuestions,
    loadSampleQuestions,
    loadMetadata,
    loadFilters,
    nextPage,
    prevPage,
    goToPage,
    clearCache,
    preloadNext,
    refresh,
  };
};

// Specialized hook for test creation
export const useTestCreationQuestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTestQuestions = useCallback(
    async (
      subjects: string[],
      chapters: string[],
      count: number,
      difficulty?: string,
      strategy: "balanced" | "random" | "weighted" = "balanced"
    ): Promise<Question[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await optimizedQuestionsAPI.getSample({
          subjects,
          chapters,
          count,
          difficulty,
          strategy,
        });

        return response.questions;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to generate test questions";
        setError(errorMessage);
        console.error("Failed to generate test questions:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getQuestionsById = useCallback(
    async (
      ids: string[],
      fields: "minimal" | "basic" | "full" = "full"
    ): Promise<Question[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await optimizedQuestionsAPI.getByIds(ids, fields);
        return response.questions;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load questions";
        setError(errorMessage);
        console.error("Failed to load questions by IDs:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    generateTestQuestions,
    getQuestionsById,
    clearError: () => setError(null),
  };
};
