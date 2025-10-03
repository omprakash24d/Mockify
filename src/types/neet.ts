// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: Pagination;
  message?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  totalQuestions: number; // Additional field that NEETDashboard expects
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Question Types
export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface QuestionStatistics {
  totalAttempts: number;
  correctAttempts: number;
  averageTimeSpent: number;
}

export interface Question {
  _id: string;
  id?: string; // Keep for backwards compatibility
  questionText: string;
  questionImage?: string; // URL or base64 of question image
  subjectName: string;
  chapterName: string;
  difficulty: "Easy" | "Medium" | "Hard" | "easy" | "medium" | "hard";
  options: QuestionOption[];
  optionImages?: string[]; // Array of image URLs/base64 for each option
  correctAnswer: string;
  explanation?: string;
  subtopics?: string[];
  subtopicTags?: string[];
  yearAppeared?: number;
  statistics: QuestionStatistics;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: Pagination;
}

// Subject Types
export interface SubjectStatistics {
  totalQuestions: number;
  totalChapters: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  color: string;
  icon: string;
  statistics?: SubjectStatistics;
  totalChapters: number;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectOverview {
  name: string;
  totalQuestions: number;
  totalChapters: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  chapters: Array<{
    name: string;
    questionCount: number;
  }>;
}

export interface ChapterProgress {
  chapterName: string;
  totalQuestions: number;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  successRate: number;
  avgTimeSpent: number;
}

export interface OverallStats {
  attemptedQuestions: number;
  totalQuestions: number;
}

export interface SubjectProgress {
  subjectName: string;
  totalQuestions: number;
  questionsAttempted: number;
  questionsCorrect: number;
  averageAccuracy: number;
  timeSpent: number;
  lastAttemptAt?: string;
  overallProgress: number;
  overallStats: OverallStats;
  chapterProgress: ChapterProgress[];
}

// Chapter Types
export interface Chapter {
  id: string;
  name: string;
  subjectName: string;
  description?: string;
  totalQuestions: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Query Parameters
export interface QuestionQueryParams {
  subject?: string;
  chapter?: string;
  difficulty?: string;
  limit?: number;
  page?: number;
  search?: string;
  yearFrom?: number;
  yearTo?: number;
  minAccuracy?: number;
  maxAccuracy?: number;
  tags?: string[];
}

export interface RandomQuestionParams {
  subject?: string;
  chapter?: string;
  difficulty?: string;
  count?: number;
  excludeAttempted?: boolean;
}

// API Service Interface
export interface QuestionsAPI {
  getAll: (
    params?: QuestionQueryParams
  ) => Promise<APIResponse<QuestionsResponse>>;
  getById: (id: string) => Promise<APIResponse<Question>>;
  getRandom: (
    params?: RandomQuestionParams
  ) => Promise<APIResponse<Question[]>>;
  search: (
    term: string,
    params?: QuestionQueryParams
  ) => Promise<APIResponse<QuestionsResponse>>;
  recordAttempt: (
    questionId: string,
    isCorrect: boolean,
    timeSpent: number
  ) => Promise<APIResponse<any>>;
  create: (question: Partial<Question>) => Promise<APIResponse<Question>>;
  update: (
    id: string,
    updates: Partial<Question>
  ) => Promise<APIResponse<Question>>;
  delete: (id: string) => Promise<APIResponse<any>>;
}

export interface SubjectsAPI {
  getAll: () => Promise<APIResponse<Subject[]>>;
  getById: (name: string) => Promise<APIResponse<Subject>>;
  getOverview: (name: string) => Promise<APIResponse<SubjectOverview>>;
  getProgress: (name: string) => Promise<APIResponse<SubjectProgress>>;
}

export interface ChaptersAPI {
  getAll: (subjectName?: string) => Promise<APIResponse<Chapter[]>>;
  getById: (name: string) => Promise<APIResponse<Chapter>>;
  getBySubject: (subjectName: string) => Promise<APIResponse<Chapter[]>>;
}

export interface AnalyticsAPI {
  getOverall: () => Promise<APIResponse<any>>;
  getBySubject: (subjectName: string) => Promise<APIResponse<any>>;
  getByChapter: (chapterName: string) => Promise<APIResponse<any>>;
}

// Hook Return Types
export interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => void;
  fetchQuestions: (params?: QuestionQueryParams) => void;
}

export interface UseQuestionReturn {
  question: Question | null;
  loading: boolean;
  error: string | null;
  recordAttempt: (isCorrect: boolean, timeSpent?: number) => Promise<boolean>;
  refresh: () => void;
}

export interface UseSubjectsReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UseSubjectReturn {
  subject: Subject | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}
