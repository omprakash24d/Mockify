import { useCallback, useEffect, useState } from "react";
import { subjectsAPI } from "../services/neetAPI.ts";
import type { Subject, SubjectOverview, SubjectProgress } from "../types/neet";

interface UseSubjectsReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useSubjects = (): UseSubjectsReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (err: any) {
      setError(err.message);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    refresh: fetchSubjects,
  };
};

interface UseSubjectReturn {
  subject: Subject | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useSubject = (subjectName: string | null): UseSubjectReturn => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubject = useCallback(async () => {
    if (!subjectName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await subjectsAPI.getById(subjectName);
      setSubject(response.data);
    } catch (err: any) {
      setError(err.message);
      setSubject(null);
    } finally {
      setLoading(false);
    }
  }, [subjectName]);

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  return {
    subject,
    loading,
    error,
    refresh: fetchSubject,
  };
};

interface UseSubjectOverviewReturn {
  overview: SubjectOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useSubjectOverview = (
  subjectName: string | null
): UseSubjectOverviewReturn => {
  const [overview, setOverview] = useState<SubjectOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    if (!subjectName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await subjectsAPI.getOverview(subjectName);
      setOverview(response.data);
    } catch (err: any) {
      setError(err.message);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [subjectName]);

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

interface UseSubjectProgressReturn {
  progress: SubjectProgress | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useSubjectProgress = (
  subjectName: string | null
): UseSubjectProgressReturn => {
  const [progress, setProgress] = useState<SubjectProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!subjectName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await subjectsAPI.getProgress(subjectName);
      setProgress(response.data);
    } catch (err: any) {
      setError(err.message);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [subjectName]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refresh: fetchProgress,
  };
};
