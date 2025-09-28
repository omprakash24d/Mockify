import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  type User as FirebaseUser,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  lastActivity: number;
  updateActivity: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

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

  const updateActivity = () => {
    setLastActivity(Date.now());
    localStorage.setItem("mockify-lastActivity", Date.now().toString());
  };

  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("mockify-lastActivity");
      localStorage.removeItem("mockify-loginAttempts");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const checkSessionTimeout = () => {
    const storedActivity = localStorage.getItem("mockify-lastActivity");
    if (storedActivity) {
      const lastActivityTime = parseInt(storedActivity);
      const timeDiff = Date.now() - lastActivityTime;

      if (timeDiff > sessionTimeout && user) {
        console.log("Session expired, logging out...");
        logout();
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    // Set persistence to local storage
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && checkSessionTimeout()) {
        setUser(firebaseUser);
        updateActivity();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Check session timeout periodically
    const timeoutCheck = setInterval(() => {
      if (user && !checkSessionTimeout()) {
        setUser(null);
      }
    }, 60000); // Check every minute

    // Update activity on user interactions
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => {
      if (user) {
        updateActivity();
      }
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      unsubscribe();
      clearInterval(timeoutCheck);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, sessionTimeout]);

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
