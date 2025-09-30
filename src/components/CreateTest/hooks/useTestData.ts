import { useState } from "react";
import {
  getChaptersBySubject,
  getQuestions,
  getSubjects,
} from "../../../services/firestore";
import type { Chapter, Question, Subject, TestFilters } from "../../../types";

export const useTestData = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = async () => {
    try {
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);
      console.log("✅ Loaded subjects:", subjectsData.length);
    } catch (error) {
      console.error("❌ Error loading subjects:", error);
      throw error;
    }
  };

  const loadAllChapters = async (subjectIds: string[]) => {
    try {
      const allChaptersData: Chapter[] = [];

      // Load chapters in parallel for better performance
      const chapterPromises = subjectIds.map((subjectId) =>
        getChaptersBySubject(subjectId).catch((err) => {
          console.warn(
            `Failed to load chapters for subject ${subjectId}:`,
            err
          );
          return [];
        })
      );

      const chapterResults = await Promise.all(chapterPromises);
      chapterResults.forEach((chapters) => allChaptersData.push(...chapters));

      setChapters(allChaptersData);
      console.log("✅ Loaded chapters:", allChaptersData.length);
    } catch (error) {
      console.error("❌ Error loading chapters:", error);
      throw error;
    }
  };

  const loadQuestions = async (
    testFilters: TestFilters,
    selectedChapters: string[]
  ) => {
    try {
      setLoading(true);
      const filters: TestFilters = {
        ...testFilters,
        chapters: selectedChapters,
      };
      const questionsData = await getQuestions(filters);
      setQuestions(questionsData);
      console.log("✅ Loaded questions:", questionsData.length);
    } catch (error) {
      console.error("❌ Error loading questions:", error);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    subjects,
    chapters,
    questions,
    loading,
    stepLoading,
    error,
    setError,
    setStepLoading,
    loadSubjects,
    loadAllChapters,
    loadQuestions,
  };
};
