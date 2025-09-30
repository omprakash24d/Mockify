import type { User as FirebaseUser } from "firebase/auth";
import { useEffect } from "react";
import { useAccountManager } from "./useAccountManager";

export function useProfileManager(user: FirebaseUser | null, isOpen: boolean) {
  const accountManager = useAccountManager(user);

  // Initialize component state when modal opens
  useEffect(() => {
    if (isOpen && user) {
      // Don't call resetForm here to avoid loops
      // The useAccountManager hook already initializes state when user changes
    }
  }, [isOpen, user?.uid]); // Only depend on user ID

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        // Don't call resetForm here either, let the parent handle close
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return accountManager;
}
