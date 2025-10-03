export interface Question {
  id: string;
  subject: "Botany" | "Chemistry" | "Physics" | "Zoology";
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: "Level 1" | "Level 2" | "Level 3" | "Level 4";
  topic: string;
  subtopic?: string;
  percentageCorrect: number;
  ncertReference?: boolean;
  videoAvailable?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
