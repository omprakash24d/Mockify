import { BookOpen, Eye, GraduationCap, Settings } from "lucide-react";
import type { TestFilters } from "../../../types";
import type { WizardStep } from "../types";

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Select Subjects",
    description: "Choose subjects for your test",
    icon: BookOpen,
    color: "blue",
  },
  {
    id: 2,
    title: "Select Chapters",
    description: "Pick specific chapters to include",
    icon: GraduationCap,
    color: "indigo",
  },
  {
    id: 3,
    title: "Configure Test",
    description: "Set difficulty, questions, and options",
    icon: Settings,
    color: "purple",
  },
  {
    id: 4,
    title: "Preview & Generate",
    description: "Review and download your test",
    icon: Eye,
    color: "green",
  },
];

export const DIFFICULTY_LEVELS = [
  {
    value: "easy",
    label: "Easy",
    color: "green",
    icon: "🟢",
    description: "Basic concepts & fundamentals",
  },
  {
    value: "medium",
    label: "Medium",
    color: "yellow",
    icon: "🟡",
    description: "Application-based problems",
  },
  {
    value: "hard",
    label: "Hard",
    color: "red",
    icon: "🔴",
    description: "Advanced & analytical questions",
  },
] as const;

export const QUESTION_COUNT_PRESETS = [20, 30, 50, 75] as const;

export const DEFAULT_TEST_FILTERS: TestFilters = {
  subjects: [],
  chapters: [],
  difficulty: ["easy", "medium", "hard"],
  questionCount: 30,
  includeImages: true,
  onlyPYQs: false,
};
