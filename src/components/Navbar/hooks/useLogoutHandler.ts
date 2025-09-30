import { useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";

/**
 * Hook to handle logout functionality with error handling
 */
export const useLogoutHandler = (
  setLogoutError: (error: string | null) => void
) => {
  const { logout } = useAuth();

  return useCallback(async () => {
    try {
      setLogoutError(null); // Clear any previous errors
      await logout();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign out";
      setLogoutError(errorMessage);
      console.error("Error signing out:", error);

      // Clear error after 5 seconds
      setTimeout(() => setLogoutError(null), 5000);
    }
  }, [logout, setLogoutError]);
};
