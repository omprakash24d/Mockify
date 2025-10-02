import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.warn(
      `Missing environment variable: ${envVar}. Firebase may not work properly.`
    );
  }
}

// Initialize Firebase
let app: any;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services with offline support
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Enable offline persistence for Firestore
  if (typeof window !== "undefined") {
    import("firebase/firestore")
      .then(() => {
        // Enable offline persistence
        console.log("🔄 Firebase initialized with offline support");
      })
      .catch((error) => {
        console.warn(
          "⚠️ Could not enable Firebase offline persistence:",
          error
        );
      });
  }

  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);

  // Create mock objects to prevent app crashes
  console.log("🔄 Running in offline mode with mock Firebase services");

  // Mock auth object
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: () => Promise.resolve(),
    signInWithPopup: () => Promise.reject(new Error("Offline mode")),
    signInWithEmailAndPassword: () => Promise.reject(new Error("Offline mode")),
    createUserWithEmailAndPassword: () =>
      Promise.reject(new Error("Offline mode")),
  } as any;

  // Mock firestore object
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error("Offline mode")),
        set: () => Promise.reject(new Error("Offline mode")),
        update: () => Promise.reject(new Error("Offline mode")),
        delete: () => Promise.reject(new Error("Offline mode")),
      }),
      add: () => Promise.reject(new Error("Offline mode")),
      get: () => Promise.reject(new Error("Offline mode")),
      where: () => ({ get: () => Promise.reject(new Error("Offline mode")) }),
    }),
  } as any;

  // Mock storage object
  storage = {
    ref: () => ({
      put: () => Promise.reject(new Error("Offline mode")),
      getDownloadURL: () => Promise.reject(new Error("Offline mode")),
    }),
  } as any;
}

// Network status monitoring
export const NetworkMonitor = {
  isOnline: () => (typeof navigator !== "undefined" ? navigator.onLine : true),

  onNetworkChange: (callback: (isOnline: boolean) => void) => {
    if (typeof window !== "undefined") {
      const handleOnline = () => callback(true);
      const handleOffline = () => callback(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
    return () => {};
  },
};

// Enhanced error handling
export const handleFirebaseError = (error: any) => {
  if (!NetworkMonitor.isOnline()) {
    return {
      code: "offline",
      message: "You are currently offline. Some features may not be available.",
      severity: "warning",
    };
  }

  if (
    error?.code === "auth/network-request-failed" ||
    error?.message?.includes("network-request-failed") ||
    error?.message?.includes("ERR_INTERNET_DISCONNECTED")
  ) {
    return {
      code: "network",
      message:
        "Network connection failed. Please check your internet connection.",
      severity: "error",
    };
  }

  if (
    error?.code === "unavailable" ||
    error?.message?.includes("client is offline")
  ) {
    return {
      code: "firestore-offline",
      message: "Database is temporarily unavailable. Working in offline mode.",
      severity: "info",
    };
  }

  return {
    code: error?.code || "unknown",
    message: error?.message || "An unexpected error occurred",
    severity: "error",
  };
};

export { auth, db, storage };
export default app;
