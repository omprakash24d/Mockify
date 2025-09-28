// Firebase Collections and Types following the ERD schema
export interface Question {
  id: string;
  exam: string;
  q_num: number;
  subject_id: string;
  chapter_id: string;
  topic_tags: string[];
  difficulty: "easy" | "medium" | "hard";
  question_text: string;
  question_media?: {
    images?: string[];
    latex?: string;
  };
  options: Array<{
    label: string;
    text: string;
  }>;
  correct_answer_index: number;
  correct_answer_text: string;
  solution_explanation: string;
  marks: number;
  negative_marks: number;
  is_active: boolean;
  source?: {
    year: number;
    exam_paper: string;
    url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  order: number;
  chapters: string[];
}

export interface Chapter {
  id: string;
  name: string;
  subject_id: string;
  topics: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  coaching_name?: string;
  coaching_logo?: string;
  role: "student" | "admin" | "coach";
  registered_at: string;
  preferences?: {
    exam: string;
    preferred_subjects: string[];
  };
}

export interface Test {
  id: string;
  user_id: string;
  title: string;
  subject_ids: string[];
  chapter_ids: string[];
  difficulty_filter: ("easy" | "medium" | "hard")[];
  num_questions: number;
  created_at: string;
}

export interface TestResponse {
  id: string;
  test_id: string;
  user_id: string;
  answers: { [questionId: string]: number };
  score: number;
  created_at: string;
}

export interface UserAttempt {
  question_id: string;
  is_correct: boolean;
  attempt_count: number;
  time_taken_sec: number;
  last_attempted_at: string;
  hints_used: number;
}

export interface Session {
  id: string;
  type: "adaptive_practice" | "chapter_test" | "full_test";
  exam: string;
  subject_id?: string;
  chapter_id?: string;
  question_ids: string[];
  answers: number[];
  score: number;
  max_score: number;
  started_at: string;
  completed_at?: string;
  average_time_per_question_sec?: number;
  difficulty_distribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface Analytics {
  id: string;
  user_id: string;
  test_id: string;
  subject_breakdown: { [subjectId: string]: number };
  chapter_breakdown: { [chapterId: string]: number };
  created_at: string;
}

export interface TestFilters {
  subjects: string[];
  chapters: string[];
  difficulty: ("easy" | "medium" | "hard")[];
  questionCount: number;
  includeImages: boolean;
  onlyPYQs: boolean;
}

// Database Collections Structure
export const COLLECTIONS = {
  ARTIFACTS: "artifacts",
  MOCKIFY: "mockifyneet", // Fixed to match actual Firebase project ID
  PUBLIC: "public",
  DATA: "data",
  QUESTIONS: "questions",
  SUBJECTS: "subjects",
  CHAPTERS: "chapters",
  USERS: "users",
  TESTS: "tests",
  ATTEMPTS: "attempts",
  SESSIONS: "sessions",
  ANALYTICS: "analytics",
  BOOKMARKS: "bookmarks",
} as const;

// Collection Paths following ERD structure
export const getCollectionPath = (collection: string) => {
  const paths = {
    questions: `${COLLECTIONS.ARTIFACTS}/${COLLECTIONS.MOCKIFY}/${COLLECTIONS.PUBLIC}/${COLLECTIONS.DATA}/${COLLECTIONS.QUESTIONS}`,
    subjects: `${COLLECTIONS.ARTIFACTS}/${COLLECTIONS.MOCKIFY}/${COLLECTIONS.PUBLIC}/${COLLECTIONS.DATA}/${COLLECTIONS.SUBJECTS}`,
    chapters: `${COLLECTIONS.ARTIFACTS}/${COLLECTIONS.MOCKIFY}/${COLLECTIONS.PUBLIC}/${COLLECTIONS.DATA}/${COLLECTIONS.CHAPTERS}`,
    users: COLLECTIONS.USERS,
    tests: COLLECTIONS.TESTS,
  };
  return paths[collection as keyof typeof paths] || collection;
};
