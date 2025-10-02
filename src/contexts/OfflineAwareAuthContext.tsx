import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  type User as FirebaseUser,
} from "firebase/auth";
import React, { createContext, useCallback, useEffect, useState } from "react";
import {
  auth,
  handleFirebaseError,
  NetworkMonitor,
} from "../lib/firebase-enhanced";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  lastActivity: number;
  isOnline: boolean;
  networkError: string | null;
  updateActivity: () => void;
  logout: () => Promise<void>;
  clearNetworkError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const OfflineAwareAuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isOnline, setIsOnline] = useState(NetworkMonitor.isOnline());
  const [networkError, setNetworkError] = useState<string | null>(null);

  const sessionTimeout = parseInt(
    import.meta.env.VITE_SESSION_TIMEOUT || "86400000"
  );

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem("mockify-lastActivity", now.toString());
  }, []);

  const clearNetworkError = useCallback(() => {
    setNetworkError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (isOnline) {
        await auth.signOut();
      } else {
        // In offline mode, just clear local state
        setUser(null);
        localStorage.removeItem("mockify-lastActivity");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if Firebase fails
      setUser(null);
      localStorage.removeItem("mockify-lastActivity");
    }
  }, [isOnline]);

  // Network status monitoring
  useEffect(() => {
    const unsubscribe = NetworkMonitor.onNetworkChange((online) => {
      setIsOnline(online);
      if (online) {
        setNetworkError(null);
        console.log("🟢 Network connection restored");
      } else {
        setNetworkError(
          "You are currently offline. Some features may not be available."
        );
        console.log("🔴 Network connection lost - working offline");
      }
    });

    return unsubscribe;
  }, []);

  // Firebase auth state monitoring with enhanced error handling
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set persistence for offline support
        if (isOnline) {
          await setPersistence(auth, browserLocalPersistence);
        }

        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            if (mounted) {
              setUser(user);
              setLoading(false);
              if (user) {
                console.log("✅ User authenticated:", user.email);
                updateActivity();
              } else {
                console.log("🚪 User logged out");
              }
            }
          },
          (error) => {
            if (mounted) {
              console.error("Auth state change error:", error);
              const { message, severity } = handleFirebaseError(error);

              if (severity === "error") {
                setNetworkError(message);
              }

              setLoading(false);
            }
          }
        );

        return unsubscribe;
      } catch (error) {
        if (mounted) {
          console.error("Auth initialization error:", error);
          const { message } = handleFirebaseError(error);
          setNetworkError(message);
          setLoading(false);
        }
        return () => {};
      }
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      mounted = false;
      unsubscribePromise.then((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, [isOnline, updateActivity]);

  // Session timeout monitoring
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const lastActivity = localStorage.getItem("mockify-lastActivity");
      const currentTime = Date.now();

      if (
        lastActivity &&
        currentTime - parseInt(lastActivity) > sessionTimeout
      ) {
        console.log("🕐 Session expired");
        logout();
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, sessionTimeout, logout]);

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    lastActivity,
    isOnline,
    networkError,
    updateActivity,
    logout,
    clearNetworkError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Keep the original AuthProvider for backward compatibility
export const AuthProvider = OfflineAwareAuthProvider;
