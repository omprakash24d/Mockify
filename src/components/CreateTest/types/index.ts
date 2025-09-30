import type { Chapter, Question, Subject, TestFilters } from "../../../types";

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface CreateTestState {
  currentStep: number;
  loading: boolean;
  stepLoading: { [key: number]: boolean };
  error: string | null;
  subjects: Subject[];
  chapters: Chapter[];
  questions: Question[];
  selectedSubjects: string[];
  selectedChapters: string[];
  testFilters: TestFilters;
  testTitle: string;
}

export interface StepComponentProps {
  state: CreateTestState;
  actions: {
    setSelectedSubjects: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedChapters: React.Dispatch<React.SetStateAction<string[]>>;
    setTestFilters: React.Dispatch<React.SetStateAction<TestFilters>>;
    setTestTitle: React.Dispatch<React.SetStateAction<string>>;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    handleSubjectToggle: (subjectId: string) => void;
    handleChapterToggle: (chapterId: string) => void;
    handleFilterChange: (key: keyof TestFilters, value: any) => void;
    loadQuestions: () => Promise<void>;
    generatePDF: () => Promise<void>;
    generateAnswerKey: () => Promise<void>;
  };
}

export interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export interface ProgressStepsProps {
  steps: WizardStep[];
  currentStep: number;
  stepLoading: { [key: number]: boolean };
}

export interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export interface LoadingStateProps {
  currentStep: number;
}
