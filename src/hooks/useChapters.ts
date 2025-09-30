import { useCallback, useEffect, useState } from "react";
import { chaptersAPI } from "../services/neetAPI.ts";
import type { Chapter } from "../types/neet";

interface UseChaptersReturn {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useChapters = (subjectName: string | null): UseChaptersReturn => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = useCallback(async () => {
    if (!subjectName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chaptersAPI.getBySubject(subjectName);
      setChapters(response.data);
    } catch (err: any) {
      setError(err.message);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [subjectName]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  return {
    chapters,
    loading,
    error,
    refresh: fetchChapters,
  };
};

interface UseChapterReturn {
  chapter: Chapter | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useChapter = (
  subjectName: string | null,
  chapterName: string | null
): UseChapterReturn => {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapter = useCallback(async () => {
    if (!subjectName || !chapterName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chaptersAPI.getById(subjectName, chapterName);
      setChapter(response.data);
    } catch (err: any) {
      setError(err.message);
      setChapter(null);
    } finally {
      setLoading(false);
    }
  }, [subjectName, chapterName]);

  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

  return {
    chapter,
    loading,
    error,
    refresh: fetchChapter,
  };
};

interface UseChapterOverviewReturn {
  overview: any | null; // TODO: Define proper overview type
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useChapterOverview = (
  subjectName: string | null,
  chapterName: string | null
): UseChapterOverviewReturn => {
  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    if (!subjectName || !chapterName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chaptersAPI.getOverview(subjectName, chapterName);
      setOverview(response.data);
    } catch (err: any) {
      setError(err.message);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [subjectName, chapterName]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    overview,
    loading,
    error,
    refresh: fetchOverview,
  };
};

interface UseChapterSubtopicsReturn {
  subtopics: string[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useChapterSubtopics = (
  subjectName: string | null,
  chapterName: string | null
): UseChapterSubtopicsReturn => {
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubtopics = useCallback(async () => {
    if (!subjectName || !chapterName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chaptersAPI.getSubtopics(subjectName, chapterName);
      setSubtopics(response.data);
    } catch (err: any) {
      setError(err.message);
      setSubtopics([]);
    } finally {
      setLoading(false);
    }
  }, [subjectName, chapterName]);

  useEffect(() => {
    fetchSubtopics();
  }, [fetchSubtopics]);

  return {
    subtopics,
    loading,
    error,
    refresh: fetchSubtopics,
  };
};
