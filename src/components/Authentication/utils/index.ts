/**
 * Authentication Utilities
 *
 * This file consolidates all utility functions used across the authentication system.
 * Includes form validation, security operations, and helper functions for a clean architecture.
 *
 * Features:
 * - Form validation and completion hints
 * - Security event processing and statistics
 * - Date/time formatting utilities
 * - Mock data generation for development
 * - Type-safe operations throughout
 */

import type { AuthFormData, SecurityEvent, SecurityStats } from "../types";

/* ============================================================================
 * FORM UTILITIES
 * ============================================================================ */

/**
 * Validates authentication form based on mode (login/signup)
 */
export const validateForm = (
  isLogin: boolean,
  formData: AuthFormData,
  passwordStrength: { isValid: boolean }
): boolean => {
  if (isLogin) {
    // For login, only email and password are required
    // Use basic email validation to ensure it's not just whitespace
    const isEmailValid =
      formData.email.trim().length > 0 &&
      formData.email.includes("@") &&
      formData.email.includes(".");
    const isPasswordValid = formData.password.length > 0;

    return isEmailValid && isPasswordValid;
  } else {
    // For signup, validate each required field individually
    const requiredFields = {
      name: formData.name.trim().length > 0,
      email:
        formData.email.trim().length > 0 &&
        formData.email.includes("@") &&
        formData.email.includes("."),
      password: formData.password.length > 0,
      confirmPassword: formData.confirmPassword.length > 0,
      coachingName: formData.coachingName.trim().length > 0,
      phoneNumber: formData.phoneNumber.trim().length > 0,
    };

    // Check if all required fields are filled
    const allFieldsFilled = Object.values(requiredFields).every(Boolean);

    // Check if passwords match
    const passwordsMatch = formData.password === formData.confirmPassword;

    // Form is valid if all conditions are met
    return allFieldsFilled && passwordsMatch && passwordStrength.isValid;
  }
};

/**
 * Generates completion hints for signup form
 */
export const getFormCompletionHints = (
  formData: AuthFormData,
  passwordStrength: { isValid: boolean }
): string[] => {
  const hints: string[] = [];

  if (!formData.name.trim()) hints.push("Full name");
  if (!formData.email.trim()) hints.push("Email address");
  if (!formData.password) hints.push("Password");
  if (!formData.confirmPassword) hints.push("Confirm password");
  if (!formData.coachingName.trim()) hints.push("Institute name");
  if (!formData.phoneNumber.trim()) hints.push("Phone number");
  if (formData.password && !passwordStrength.isValid)
    hints.push("Strong password");
  if (
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword
  ) {
    hints.push("Passwords match");
  }

  return hints;
};

/**
 * Returns empty form data structure
 */
export const clearFormData = (): AuthFormData => ({
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  coachingName: "",
  phoneNumber: "",
  coachingLogo: "",
});

/**
 * Returns partial form data for clearing signup-specific fields
 */
export const clearSignupFields = (): Partial<AuthFormData> => ({
  name: "",
  coachingName: "",
  phoneNumber: "",
  coachingLogo: "",
  confirmPassword: "",
});

/* ============================================================================
 * SECURITY UTILITIES
 * ============================================================================ */

/**
 * Format timestamp to human-readable format with relative time
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

/**
 * Format event type to human-readable string
 */
export const formatEventType = (type: string): string => {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
};

/**
 * Calculate comprehensive security statistics from events
 */
export const calculateSecurityStats = (
  events: SecurityEvent[]
): SecurityStats => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  return {
    totalEvents: events.length,
    criticalEvents: events.filter((e) => e.severity === "critical").length,
    highSeverityEvents: events.filter((e) => e.severity === "high").length,
    recentLoginAttempts: events.filter(
      (e) => e.type.includes("login") && e.timestamp > oneHourAgo
    ).length,
    activeRateLimits: events.filter(
      (e) => e.type === "rate_limit_exceeded" && e.timestamp > oneHourAgo
    ).length,
  };
};

/**
 * Filter events by severity level
 */
export const filterEventsBySeverity = (
  events: SecurityEvent[],
  severity: "low" | "medium" | "high" | "critical"
): SecurityEvent[] => {
  return events.filter((event) => event.severity === severity);
};

/**
 * Get events within a specific time range
 */
export const getEventsInTimeRange = (
  events: SecurityEvent[],
  hoursAgo: number
): SecurityEvent[] => {
  const cutoff = Date.now() - hoursAgo * 60 * 60 * 1000;
  return events.filter((event) => event.timestamp > cutoff);
};

/**
 * Generate mock security events for development and testing
 */
export const generateMockSecurityEvents = (): SecurityEvent[] => {
  const now = Date.now();

  return [
    {
      id: "1",
      type: "login_success",
      severity: "low",
      timestamp: now - 30 * 60 * 1000, // 30 minutes ago
      description: "Successful login from trusted device",
      userId: "user123",
      email: "user@example.com",
      details: { sessionId: "session_123" },
    },
    {
      id: "2",
      type: "login_failure",
      severity: "medium",
      timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
      description: "Failed login attempt - incorrect password",
      userId: "unknown",
      email: "attacker@example.com",
      details: { attemptCount: 3 },
    },
    {
      id: "3",
      type: "rate_limit_exceeded",
      severity: "high",
      timestamp: now - 4 * 60 * 60 * 1000, // 4 hours ago
      description: "Rate limit exceeded for IP address",
      userId: "unknown",
      details: { limit: 5, count: 10 },
    },
    {
      id: "4",
      type: "account_locked",
      severity: "critical",
      timestamp: now - 6 * 60 * 60 * 1000, // 6 hours ago
      description: "Account locked due to suspicious activity",
      userId: "user456",
      email: "suspicious@example.com",
      details: { attemptCount: 5 },
    },
    {
      id: "5",
      type: "password_change",
      severity: "low",
      timestamp: now - 12 * 60 * 60 * 1000, // 12 hours ago
      description: "Password successfully changed",
      userId: "user123",
      email: "user@example.com",
    },
  ];
};

/* ============================================================================
 * VALIDATION UTILITIES
 * ============================================================================ */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Generate password strength assessment - DEPRECATED
 * Use SecurityManager.validatePasswordStrength() instead for consistent validation
 */
