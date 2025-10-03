import { useState } from "react";
import { chaptersAPI, subjectsAPI } from "../../../services/neetAPI";
import { optimizedQuestionsAPI } from "../../../services/optimizedNeetAPI";
import type { Chapter, Question, Subject, TestFilters } from "../../../types";
import type {
  Chapter as NEETChapter,
  Subject as NEETSubject,
} from "../../../types/neet";

export const useOptimizedTestData = () => {
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
              order: index + 1,
              chapters: fakeChapters, // Populate with correct count for display
            };
          }
        );
        setSubjects(convertedSubjects);
        console.log(
          "✅ [Optimized] Subjects loaded successfully from MongoDB:",
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
                topics: [],
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
        "✅ [Optimized] Chapters loaded successfully from MongoDB:",
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

      // Use optimized API for better performance with large datasets
      const sampleParams = {
        subjects: testFilters.subjects || [],
        chapters: selectedChapters,
        count: testFilters.questionCount || 50,
        difficulty: Array.isArray(testFilters.difficulty)
          ? testFilters.difficulty[0]
          : testFilters.difficulty,
        strategy: "balanced" as const,
      };

      const response = await optimizedQuestionsAPI.getSample(sampleParams);

      // Map to expected format for compatibility
      const questionsData = response.questions.map((q: any, index: number) => ({
        id: q._id || q.id || "",
        exam: "NEET",
        q_num: q.questionNumberForChapter || index + 1,
        subject_id: q.subjectName,
        chapter_id: q.chapterName,
        topic_tags: q.subtopicTags || [],
        difficulty: (q.difficulty || "medium").toLowerCase() as
          | "easy"
          | "medium"
          | "hard",
        question_text: q.questionText,
        question_media: q.imageUrl ? { images: [q.imageUrl] } : undefined,
        options: q.options.map((opt: any, idx: number) => ({
          label: String.fromCharCode(65 + idx), // A, B, C, D
          text: opt.text,
        })),
        correct_answer_index: q.options.findIndex((opt: any) => opt.isCorrect),
        correct_answer_text: q.correctAnswer,
        solution_explanation: q.explanation || "",
        marks: 4,
        negative_marks: 1,
        is_active: true,
        source: q.examYear
          ? {
              year: q.examYear,
              exam_paper: "NEET",
            }
          : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as Question[];

      setQuestions(questionsData);
    } catch (error) {
      console.error("❌ Error loading questions:", error);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // New method for getting questions by specific criteria
  const loadQuestionsSample = async (
    subjects: string[],
    chapters: string[],
    count: number,
    difficulty?: string,
    strategy: "balanced" | "random" | "weighted" = "balanced"
  ) => {
    try {
      setLoading(true);

      const response = await optimizedQuestionsAPI.getSample({
        subjects,
        chapters,
        count,
        difficulty,
        strategy,
      });

      const questionsData = response.questions.map((q: any, index: number) => ({
        id: q._id || q.id || "",
        exam: "NEET",
        q_num: q.questionNumberForChapter || index + 1,
        subject_id: q.subjectName,
        chapter_id: q.chapterName,
        topic_tags: q.subtopicTags || [],
        difficulty: (q.difficulty || "medium").toLowerCase() as
          | "easy"
          | "medium"
          | "hard",
        question_text: q.questionText,
        question_media: q.imageUrl ? { images: [q.imageUrl] } : undefined,
        options: q.options.map((opt: any, idx: number) => ({
          label: String.fromCharCode(65 + idx), // A, B, C, D
          text: opt.text,
        })),
        correct_answer_index: q.options.findIndex((opt: any) => opt.isCorrect),
        correct_answer_text: q.correctAnswer,
        solution_explanation: q.explanation || "",
        marks: 4,
        negative_marks: 1,
        is_active: true,
        source: q.examYear
          ? {
              year: q.examYear,
              exam_paper: "NEET",
            }
          : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as Question[];

      setQuestions(questionsData);
      return questionsData;
    } catch (error) {
      console.error("❌ Error loading sample questions:", error);
      setError("Failed to load questions. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Method to get metadata about available questions
  const loadQuestionsMetadata = async () => {
    try {
      const metadata = await optimizedQuestionsAPI.getMetadata();
      return metadata;
    } catch (error) {
      console.error("❌ Error loading questions metadata:", error);
      setError("Failed to load questions metadata.");
      return null;
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
    loadQuestionsSample,
    loadQuestionsMetadata,
  };
};
