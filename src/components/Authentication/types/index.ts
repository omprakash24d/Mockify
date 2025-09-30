/**
 * Authentication Types
 *
 * This file consolidates all TypeScript type definitions used across the authentication system.
 * Includes form data, state management, security events, and handler interfaces.
 *
 * Features:
 * - Comprehensive form data types
 * - Authentication state management types
 * - Security event and statistics types
 * - Handler interface definitions
 * - Password strength assessment types
 */

import type { User as FirebaseUser } from "firebase/auth";
import type { CoachingDetailsFormData } from "../../../lib/validations";

/* ============================================================================
 * AUTHENTICATION FORM TYPES
 * ============================================================================ */

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  coachingName: string;
  phoneNumber: string;
  coachingLogo: string;
}

export interface AuthState {
  isLogin: boolean;
  loading: boolean;
  googleLoading: boolean;
  resetLoading: boolean;
  error: string;
  resetEmailSent: boolean;
  validationErrors: Record<string, string>;
  showCoachingModal: boolean;
  pendingUser: FirebaseUser | null;
  isFormValid: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export interface PasswordStrength {
  isValid: boolean;
  feedback: string[];
  score: number;
  strength: "very-weak" | "weak" | "fair" | "good" | "strong";
}

/* ============================================================================
 * HANDLER INTERFACES
 * ============================================================================ */

export interface AuthHandlers {
  handleEmailAuth: (e: React.FormEvent) => Promise<void>;
  handleGoogleAuth: () => Promise<void>;
  handlePasswordReset: () => Promise<void>;
  handleCoachingDetailsComplete: (
    details: CoachingDetailsFormData
  ) => Promise<void>;
  toggleAuthMode: () => void;
  togglePasswordVisibility: () => void;
  toggleConfirmPasswordVisibility: () => void;
}

export interface FormFieldHandlers {
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setName: (value: string) => void;
  setCoachingName: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setCoachingLogo: (value: string) => void;
}

/* ============================================================================
 * SECURITY TYPES
 * ============================================================================ */

export interface SecurityEvent {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: number;
  description: string;
  userId: string;
  email?: string;
  details?: {
    sessionId?: string;
    limit?: number;
    count?: number;
    attemptCount?: number;
  };
}

export interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  recentLoginAttempts: number;
  activeRateLimits: number;
}

export type EventType =
  | "login_success"
  | "login_failure"
  | "account_locked"
  | "account_unlocked"
  | "rate_limit_exceeded"
  | "password_change"
  | "mfa_enrollment";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

/* ============================================================================
 * COMPONENT PROP TYPES
 * ============================================================================ */

export interface MessageComponentProps {
  error?: string;
  success?: {
    show: boolean;
    title: string;
    message: string;
  };
}

export interface FormValidationProps {
  isLogin: boolean;
  isFormValid: boolean;
  formData: AuthFormData;
  passwordStrength: PasswordStrength;
}

export interface SecurityDashboardProps {
  events?: SecurityEvent[];
  stats?: SecurityStats;
  loading?: boolean;
}

/* ============================================================================
 * UTILITY TYPES
 * ============================================================================ */

export interface TimestampOptions {
  format?: "relative" | "absolute" | "both";
  includeSeconds?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface AuthServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
