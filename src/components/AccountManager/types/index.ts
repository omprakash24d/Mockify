export interface PasswordStrength {
  isValid: boolean;
  errors: string[];
  score: number;
}

export interface StudyAvatar {
  name: string;
  emoji: string;
  color: string;
}

export type ActiveTab = "profile" | "password";

export interface ProfileFormData {
  displayName: string;
  selectedAvatar: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface FormErrors {
  displayName: string;
  password: string;
  general: string;
}

export interface LoadingStates {
  profile: boolean;
  password: boolean;
}

export interface VisibilityStates {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}
