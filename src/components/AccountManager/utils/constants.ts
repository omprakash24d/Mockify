import type { StudyAvatar } from "../types";

// Error message mapping for Firebase auth errors
export const ERROR_MESSAGES: Record<string, string> = {
  "auth/wrong-password": "Current password is incorrect",
  "auth/requires-recent-login":
    "Please sign out and sign back in before changing your password",
  "auth/weak-password":
    "The new password is too weak. Please choose a stronger password.",
  "auth/too-many-requests": "Too many failed attempts. Please try again later.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
  default: "An unexpected error occurred. Please try again.",
} as const;

// Study-themed avatar options
export const STUDY_AVATARS: readonly StudyAvatar[] = [
  { name: "Book", emoji: "📚", color: "bg-blue-500" },
  { name: "Graduate", emoji: "🎓", color: "bg-green-500" },
  { name: "Pencil", emoji: "✏️", color: "bg-yellow-500" },
  { name: "Microscope", emoji: "🔬", color: "bg-purple-500" },
  { name: "Calculator", emoji: "🧮", color: "bg-red-500" },
  { name: "Lightbulb", emoji: "💡", color: "bg-orange-500" },
  { name: "Trophy", emoji: "🏆", color: "bg-amber-500" },
  { name: "Target", emoji: "🎯", color: "bg-indigo-500" },
] as const;
