/**
 * Auth Debug Hook
 *
 * Provides debugging information for authentication state changes
 */

import { useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";

export const useAuthDebug = () => {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("🔍 Auth State Debug:", {
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
          }
        : null,
      loading,
      isAuthenticated,
      timestamp: new Date().toISOString(),
    });
  }, [user, loading, isAuthenticated]);

  useEffect(() => {
    if (user && !user.emailVerified) {
      console.log("⚠️ User needs email verification:", {
        email: user.email,
        shouldRedirect: true,
        currentPath: window.location.pathname,
      });
    }
  }, [user]);

  return { user, loading, isAuthenticated };
};
