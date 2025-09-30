import type { TestFilters } from "../../../types";

export const canProceedToNextStep = (
  currentStep: number,
  selectedSubjects: string[],
  selectedChapters: string[],
  testFilters: TestFilters,
  questionsLength: number
): boolean => {
  switch (currentStep) {
    case 1:
      return selectedSubjects.length > 0;
    case 2:
      return selectedChapters.length > 0;
    case 3:
      return testFilters.questionCount > 0;
    case 4:
      return questionsLength > 0;
    default:
      return false;
  }
};

export const generateTestTitle = (
  selectedSubjects: string[],
  subjects: Array<{ id: string; name: string }>
): string => {
  const selectedSubjectNames = subjects
    .filter((s) => selectedSubjects.includes(s.id))
    .map((s) => s.name);

  if (selectedSubjectNames.length === 1) {
    return `${selectedSubjectNames[0]} Test`;
  } else if (selectedSubjectNames.length > 1) {
    return "Multi-Subject Test";
  } else {
    return "";
  }
};

export const formatDifficultyText = (difficulty: string): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

export const calculateEstimatedQuestions = (
  chapters: Array<{ topics?: unknown[] }>
): number => {
  return chapters.reduce(
    (sum, c) => sum + Math.max(1, (c.topics?.length || 0) * 3),
    0
  );
};

export const calculateTotalTopics = (
  chapters: Array<{ topics?: unknown[] }>
): number => {
  return chapters.reduce((sum, c) => sum + (c.topics?.length || 0), 0);
};

export const calculateTotalMarks = (
  questions: Array<{ marks?: number }>
): number => {
  return questions.reduce((sum, q) => sum + (q.marks || 1), 0);
};
