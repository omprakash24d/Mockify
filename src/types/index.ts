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
  chapter_id: string;
  chapter_name: string;
  subject_id: string;
  topics?: string[];
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

export interface Test {
  id: string;
  exam: string;
  type: "full_test" | "chapter_test" | "practice_test";
  subject_ids: string[];
  question_ids: string[];
  total_marks: number;
  duration_minutes: number;
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
