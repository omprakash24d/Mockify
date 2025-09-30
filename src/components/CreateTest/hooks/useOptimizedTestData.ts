import { useState } from "react";
import { getChaptersBySubject, getSubjects } from "../../../services/firestore";
import { optimizedQuestionsAPI } from "../../../services/optimizedNeetAPI";
import type { Chapter, Question, Subject, TestFilters } from "../../../types";

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
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);
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
