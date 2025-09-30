import { useCallback, useEffect, useMemo, useState } from "react";
import { questionsAPI } from "../services/neetAPI.ts";
import type { Pagination, Question, RandomQuestionParams } from "../types/neet";

interface UseQuestionsParams {
  subject?: string;
  chapter?: string;
  difficulty?: string;
  limit?: number;
  page?: number;
  search?: string;
}

interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => void;
  fetchQuestions: (params?: UseQuestionsParams) => void;
}

export const useQuestions = (
  initialParams: UseQuestionsParams = {}
): UseQuestionsReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    totalQuestions: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });

  // Memoize the initial params to prevent unnecessary re-renders
  const memoizedInitialParams = useMemo(
    () => initialParams,
    [
      initialParams.subject,
      initialParams.chapter,
      initialParams.difficulty,
      initialParams.limit,
      initialParams.page,
      initialParams.search,
    ]
  );

  const fetchQuestions = useCallback(
    async (params: UseQuestionsParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await questionsAPI.getAll({
          ...memoizedInitialParams,
          ...params,
        });
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      } catch (err: any) {
        setError(err.message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    },
    [memoizedInitialParams]
  );

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      fetchQuestions({ page: pagination.currentPage + 1 });
    }
  }, [pagination.hasNext, pagination.currentPage, fetchQuestions]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      fetchQuestions({ page: pagination.currentPage - 1 });
    }
  }, [pagination.hasPrev, pagination.currentPage, fetchQuestions]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        fetchQuestions({ page });
      }
    },
    [pagination.totalPages, fetchQuestions]
  );

  const refresh = useCallback(() => {
    fetchQuestions({ page: pagination.currentPage });
  }, [pagination.currentPage, fetchQuestions]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    refresh,
    fetchQuestions,
  };
};

interface UseQuestionReturn {
  question: Question | null;
  loading: boolean;
  error: string | null;
  recordAttempt: (isCorrect: boolean, timeSpent?: number) => Promise<boolean>;
  refresh: () => void;
}

export const useQuestion = (questionId: string | null): UseQuestionReturn => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = useCallback(async () => {
    if (!questionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await questionsAPI.getById(questionId);
      setQuestion(response.data);
    } catch (err: any) {
      setError(err.message);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  const recordAttempt = useCallback(
    async (isCorrect: boolean, timeSpent: number = 0): Promise<boolean> => {
      if (!questionId) return false;

      try {
        await questionsAPI.recordAttempt(questionId, isCorrect, timeSpent);
        // Refresh question data to get updated statistics
        await fetchQuestion();
        return true;
      } catch (err) {
        console.error("Failed to record attempt:", err);
        return false;
      }
    },
    [questionId, fetchQuestion]
  );

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  return {
    question,
    loading,
    error,
    recordAttempt,
    refresh: fetchQuestion,
  };
};

interface UseRandomQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  fetchRandomQuestions: (params?: RandomQuestionParams) => void;
}

export const useRandomQuestions = (
  params: RandomQuestionParams = {}
): UseRandomQuestionsReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the params to prevent unnecessary re-renders
  const memoizedParams = useMemo(
    () => params,
    [
      params.count,
      params.subject,
      params.chapter,
      params.difficulty,
      params.excludeAttempted,
    ]
  );

  const fetchRandomQuestions = useCallback(
    async (newParams: RandomQuestionParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await questionsAPI.getRandom({
          ...memoizedParams,
          ...newParams,
        });
        setQuestions(response.data);
      } catch (err: any) {
        setError(err.message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    },
    [memoizedParams]
  );

  const refresh = useCallback(() => {
    fetchRandomQuestions();
  }, [fetchRandomQuestions]);

  useEffect(() => {
    fetchRandomQuestions();
  }, [fetchRandomQuestions]);

  return {
    questions,
    loading,
    error,
    refresh,
    fetchRandomQuestions,
  };
};

interface UseQuestionSearchReturn {
  results: Question[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  pagination: Pagination;
  search: (term: string, params?: UseQuestionsParams) => void;
  clearSearch: () => void;
}

export const useQuestionSearch = (): UseQuestionSearchReturn => {
  const [results, setResults] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    totalQuestions: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });

  const search = useCallback(
    async (term: string, params: UseQuestionsParams = {}) => {
      if (!term || term.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      setSearchTerm(term);

      try {
        const response = await questionsAPI.search(term, params);
        setResults(response.data.questions);
        setPagination(response.data.pagination);
      } catch (err: any) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
    setResults([]);
    setSearchTerm("");
    setError(null);
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      totalQuestions: 0,
      itemsPerPage: 10,
      hasNext: false,
      hasPrev: false,
    });
  }, []);

  return {
    results,
    loading,
    error,
    searchTerm,
    pagination,
    search,
    clearSearch,
  };
};
