import { useState } from "react";
import {
  chaptersAPI,
  questionsAPI,
  subjectsAPI,
} from "../../../services/neetAPI";
import type { Chapter, Question, Subject, TestFilters } from "../../../types";
import type {
  Chapter as NEETChapter,
  Subject as NEETSubject,
} from "../../../types/neet";

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
      const response = await subjectsAPI.getAll();
      if (response.success && response.data) {
        // Convert NEET API Subject format to CreateTest Subject format
        const convertedSubjects: Subject[] = response.data.map(
          (neetSubject: NEETSubject, index: number) => {
            // Extract chapter count from statistics
            const chapterCount =
              neetSubject.statistics?.totalChapters ||
              neetSubject.totalChapters ||
              0;

            // Create fake chapter IDs for the count (will be replaced when chapters are actually loaded)
            const fakeChapters = Array.from(
              { length: chapterCount },
              (_, i) => `${neetSubject.id}_chapter_${i}`
            );

            return {
              id: neetSubject.id,
              name: neetSubject.name,
              order: index + 1, // Assign order based on array position
              chapters: fakeChapters, // Populate with correct count for display
            };
          }
        );
        setSubjects(convertedSubjects);
        console.log(
          "✅ Subjects loaded successfully from MongoDB:",
          convertedSubjects.length
        );
      } else {
        throw new Error("Failed to fetch subjects from API");
      }
    } catch (error) {
      console.error("❌ Error loading subjects:", error);
      throw error;
    }
  };

  const loadAllChapters = async (subjectIds: string[]) => {
    try {
      const allChaptersData: Chapter[] = [];

      // Load chapters in parallel for better performance using MongoDB API
      const chapterPromises = subjectIds.map(async (subjectId) => {
        try {
          // Find subject name from the current subjects list
          const subject = subjects.find((s) => s.id === subjectId);
          if (subject) {
            const chaptersResponse = await chaptersAPI.getBySubject(
              subject.name
            );
            if (chaptersResponse.success && chaptersResponse.data) {
              // Convert NEET API Chapter format to CreateTest Chapter format
              return chaptersResponse.data.map((neetChapter: NEETChapter) => ({
                id: neetChapter.id,
                chapter_id: neetChapter.id,
                chapter_name: neetChapter.name,
                subject_id: subjectId,
                topics: [], // NEET API doesn't have topics in Chapter, will be populated separately if needed
              }));
            }
          }
          return [];
        } catch (err) {
          console.warn(
            `Failed to load chapters for subject ${subjectId}:`,
            err
          );
          return [];
        }
      });

      const chapterResults = await Promise.all(chapterPromises);
      chapterResults.forEach((chapters: Chapter[]) =>
        allChaptersData.push(...chapters)
      );

      setChapters(allChaptersData);
      console.log(
        "✅ Chapters loaded successfully from MongoDB:",
        allChaptersData.length
      );
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

      // Convert chapter IDs to chapter names for the API
      const chapterNames = selectedChapters
        .map((chapterId) => {
          const chapter = chapters.find((c) => c.id === chapterId);
          return chapter?.chapter_name || chapterId;
        })
        .filter((name) => name && name !== "unknown");

      // Convert subject IDs to subject names for the API
      const subjectNames =
        testFilters.subjects
          ?.map((subjectId) => {
            const subject = subjects.find((s) => s.id === subjectId);
            return subject?.name || subjectId;
          })
          .filter((name) => name) || [];

      // Convert TestFilters to MongoDB API query parameters
      const queryParams: any = {
        page: 1,
        limit: testFilters.questionCount || 50,
      };

      // Only add boolean parameters if they are true
      if (testFilters.onlyPYQs === true) {
        queryParams.onlyPYQs = true;
      }

      // Only add parameters if they have meaningful values (not empty strings)
      if (subjectNames.length > 0 && subjectNames.some((name) => name.trim())) {
        queryParams.subject = subjectNames
          .filter((name) => name.trim())
          .join(",");
      }

      // Limit chapters to prevent overly long URLs (max 10 chapters per request)
      if (chapterNames.length > 0 && chapterNames.some((name) => name.trim())) {
        const filteredChapters = chapterNames.filter((name) => name.trim());
        // If too many chapters, just use subject filter instead
        if (filteredChapters.length <= 10) {
          queryParams.chapter = filteredChapters.join(",");
        } else {
          console.log(
            `Too many chapters (${filteredChapters.length}), using subject filter only`
          );
        }
      }

      // Add difficulty filter carefully to avoid backend conflicts
      if (
        testFilters.difficulty &&
        testFilters.difficulty.length > 0 &&
        testFilters.difficulty.length < 3
      ) {
        // If all 3 difficulties are selected, don't filter
        // Only add difficulty if we have a stable base query (subject or no filters)
        if (queryParams.subject || Object.keys(queryParams).length === 2) {
          // page and limit only
          queryParams.difficulty = testFilters.difficulty.join(",");
        }
      }

      const response = await questionsAPI.getAll(queryParams);

      if (response.success && response.data) {
        // Convert NEET API questions to CreateTest format
        const neetQuestions = response.data.questions || [];
        const convertedQuestions: Question[] = neetQuestions.map(
          (neetQ: any, index: number) => ({
            id: neetQ._id || neetQ.id || `q_${index}`,
            exam: "NEET",
            q_num: index + 1,
            subject_id: neetQ.subjectName || "unknown",
            chapter_id: neetQ.chapterName || "unknown",
            topic_tags: neetQ.subtopics || neetQ.subtopicTags || [],
            difficulty:
              (neetQ.difficulty?.toLowerCase() as "easy" | "medium" | "hard") ||
              "medium",
            question_text: neetQ.questionText || "",
            question_media: neetQ.questionImage
              ? { images: [neetQ.questionImage] }
              : undefined,
            options:
              neetQ.options?.map((opt: any, optIndex: number) => ({
                label: String.fromCharCode(65 + optIndex), // A, B, C, D
                text: opt.text || opt,
              })) || [],
            correct_answer_index:
              neetQ.options?.findIndex((opt: any) => opt.isCorrect) || 0,
            correct_answer_text: neetQ.correctAnswer || "",
            solution_explanation: neetQ.explanation || "",
            marks: 4, // Standard NEET marks
            negative_marks: 1, // Standard NEET negative marks
            is_active: true,
            source: neetQ.yearAppeared
              ? {
                  year: neetQ.yearAppeared,
                  exam_paper: "NEET",
                }
              : undefined,
            created_at: neetQ.createdAt || new Date().toISOString(),
            updated_at: neetQ.updatedAt || new Date().toISOString(),
          })
        );

        setQuestions(convertedQuestions);
        console.log(
          "✅ Questions loaded successfully from MongoDB:",
          convertedQuestions.length
        );
      } else {
        throw new Error("Failed to fetch questions from API");
      }
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
