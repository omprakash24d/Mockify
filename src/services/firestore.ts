// Firebase imports handled by MockifyAPI service
import type { Chapter, Question, Subject, TestFilters } from "../types";
import { MockifyAPI } from "./mockifyAPI";

// Wrapper functions to maintain compatibility with existing code
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    return await MockifyAPI.getSubjects();
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

export const getChaptersBySubject = async (
  subjectId: string
): Promise<Chapter[]> => {
  try {
    const chapters = await MockifyAPI.getChaptersBySubject(subjectId);
    // Map to match existing interface
    return chapters.map((chapter) => ({
      id: chapter.id,
      chapter_id: chapter.id,
      chapter_name: chapter.name,
      subject_id: chapter.subject_id,
      topics: chapter.topics,
    })) as Chapter[];
  } catch (error) {
    console.error("Error fetching chapters:", error);
    throw error;
  }
};

export const getQuestions = async (
  filters: TestFilters
): Promise<Question[]> => {
  try {
    const questions = await MockifyAPI.getQuestions(filters);

    // Shuffle questions for randomization
    const shuffled = questions.sort(() => Math.random() - 0.5);

    return shuffled.slice(0, filters.questionCount);
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const getChaptersBySubjects = async (
  subjectIds: string[]
): Promise<Chapter[]> => {
  try {
    if (subjectIds.length === 0) return [];

    const allChapters: Chapter[] = [];

    // Batch requests for multiple subjects
    for (const subjectId of subjectIds) {
      const chapters = await getChaptersBySubject(subjectId);
      allChapters.push(...chapters);
    }

    return allChapters;
  } catch (error) {
    console.error("Error fetching chapters by subjects:", error);
    throw error;
  }
};

export const getChapter = async (
  chapterId: string
): Promise<Chapter | null> => {
  try {
    const chapter = await MockifyAPI.getChapter(chapterId);
    if (!chapter) return null;

    // Map to match existing interface
    return {
      id: chapter.id,
      chapter_id: chapter.id,
      chapter_name: chapter.name,
      subject_id: chapter.subject_id,
      topics: chapter.topics,
    } as Chapter;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
};

export const getSubject = async (
  subjectId: string
): Promise<Subject | null> => {
  try {
    return await MockifyAPI.getSubject(subjectId);
  } catch (error) {
    console.error("Error fetching subject:", error);
    throw error;
  }
};

export const searchQuestions = async (
  searchTerm: string,
  filters?: Partial<TestFilters>
): Promise<Question[]> => {
  try {
    const questions = await MockifyAPI.getQuestions(filters || {});

    // Filter by search term on client side
    const filteredQuestions = questions.filter(
      (question) =>
        question.question_text
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        question.topic_tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return filteredQuestions;
  } catch (error) {
    console.error("Error searching questions:", error);
    throw error;
  }
};

// Additional legacy compatibility functions
export const getQuestionsByChapter = async (
  chapterId: string,
  difficulty?: "easy" | "medium" | "hard",
  limitCount: number = 50
): Promise<Question[]> => {
  try {
    const filters: TestFilters = {
      subjects: [],
      chapters: [chapterId],
      difficulty: difficulty ? [difficulty] : [],
      questionCount: limitCount,
      onlyPYQs: false,
      includeImages: true,
    };

    return await getQuestions(filters);
  } catch (error) {
    console.error("Error fetching questions by chapter:", error);
    throw error;
  }
};
