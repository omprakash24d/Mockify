import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  type User as FirebaseUser,
} from "firebase/auth";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import AuthSecurityMiddleware from "../middleware/authSecurity";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  lastActivity: number;
  updateActivity: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// useAuth hook moved to hooks/useAuth.ts for better organization

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const sessionTimeout = parseInt(
    import.meta.env.VITE_SESSION_TIMEOUT || "86400000"
  ); // 24 hours default

  const securityMiddleware = AuthSecurityMiddleware.getInstance();

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem("mockify-lastActivity", now.toString());

    // Update session activity in security middleware
    if (user) {
      securityMiddleware.updateSessionActivity(user.uid);
    }
  }, [user, securityMiddleware]);

  const logout = useCallback(async () => {
    try {
      // Use secure logout that clears all session data
      await securityMiddleware.secureLogout();
    } catch (error) {
      console.error("Error during secure logout:", error);
    }
  }, [securityMiddleware]);

  const checkSessionTimeout = useCallback(() => {
    const storedActivity = localStorage.getItem("mockify-lastActivity");
    if (storedActivity) {
      const lastActivityTime = parseInt(storedActivity);
      const timeDiff = Date.now() - lastActivityTime;

      if (timeDiff > sessionTimeout) {
        // Session expired, logging out
        return false;
      }
    } else {
      // No stored activity means this is a fresh authentication
      // Initialize activity timestamp for new sessions
      localStorage.setItem("mockify-lastActivity", Date.now().toString());
    }
    return true;
  }, [sessionTimeout]);

  useEffect(() => {
    // Set persistence to local storage with error handling
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn("Could not set Firebase persistence:", error);
      // Continue without persistence if network is unavailable
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && checkSessionTimeout()) {
        try {
          // Create or validate secure session
          const session = securityMiddleware.validateSession(firebaseUser.uid);
          if (session) {
            // Check for potential session hijacking
            if (securityMiddleware.detectSessionHijacking(session)) {
              console.warn(
                "Potential security threat detected, logging out user"
              );
              logout();
              return;
            }
            setUser(firebaseUser);
            updateActivity();
          } else {
            // Create new session - do this asynchronously to avoid blocking
            Promise.resolve().then(() => {
              securityMiddleware.createSession(firebaseUser);
            });
            setUser(firebaseUser);
            updateActivity();
          }
        } catch (error) {
          console.error("Session management error:", error);
          // Fall back to basic authentication without session middleware
          setUser(firebaseUser);
          updateActivity();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [checkSessionTimeout, updateActivity]);

  // Separate effect for session timeout checking
  useEffect(() => {
    if (!user) return;

    const timeoutCheck = setInterval(() => {
      if (!checkSessionTimeout()) {
        logout();
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(timeoutCheck);
    };
  }, [user, checkSessionTimeout, logout]);

  // Separate effect for activity tracking
  useEffect(() => {
    if (!user) return;

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];

    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [user, updateActivity]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    lastActivity,
    updateActivity,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
