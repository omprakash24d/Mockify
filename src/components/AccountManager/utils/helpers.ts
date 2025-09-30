import { ERROR_MESSAGES } from "./constants";

// Helper function to get user-friendly error messages
export const getErrorMessage = (error: unknown): string => {
  const err = error as { code?: string; message?: string };
  return (
    ERROR_MESSAGES[err.code as keyof typeof ERROR_MESSAGES] ||
    err.message ||
    ERROR_MESSAGES.default
  );
};

// Validate display name
export const validateDisplayName = (displayName: string): string => {
  if (displayName.length < 2) {
    return "Display name must be at least 2 characters";
  }
  if (displayName.length > 50) {
    return "Display name must be less than 50 characters";
  }
  if (!/^[a-zA-Z0-9\s\-_.]+$/.test(displayName)) {
    return "Display name can only contain letters, numbers, spaces, and common symbols";
  }
  return "";
};
