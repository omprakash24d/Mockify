import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { enableNetwork, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Network status tracking
export let isFirebaseOnline = true;

// Enhanced error handling and network management
export class FirebaseNetworkManager {
  private static retryAttempts = 0;
  private static maxRetries = 3;
  private static retryDelay = 1000; // Start with 1 second

  static async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // Simple network check
      await fetch("https://www.google.com/favicon.ico", {
        mode: "no-cors",
        signal: AbortSignal.timeout(5000),
      });
      return true;
    } catch {
      return false;
    }
  }

  static async handleNetworkError(error: any): Promise<void> {
    console.warn("Firebase network error detected:", error);

    if (this.isNetworkError(error)) {
      isFirebaseOnline = false;

      // Try to reconnect after a delay
      setTimeout(async () => {
        const isOnline = await this.checkNetworkConnectivity();
        if (isOnline) {
          try {
            await enableNetwork(db);
            isFirebaseOnline = true;
            this.retryAttempts = 0;
            console.log("Firebase network restored");
          } catch (enableError) {
            console.error("Failed to re-enable Firebase network:", enableError);
          }
        }
      }, this.retryDelay);

      // Exponential backoff
      this.retryDelay = Math.min(this.retryDelay * 2, 30000);
      this.retryAttempts++;
    }
  }

  static isNetworkError(error: any): boolean {
    if (!error) return false;

    const networkErrorCodes = [
      "unavailable",
      "deadline-exceeded",
      "network-request-failed",
    ];

    const networkErrorMessages = [
      "ERR_NAME_NOT_RESOLVED",
      "ERR_NETWORK_CHANGED",
      "ERR_INTERNET_DISCONNECTED",
      "failed to fetch",
      "network error",
      "offline",
    ];

    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code?.toLowerCase() || "";

    return (
      networkErrorCodes.includes(errorCode) ||
      networkErrorMessages.some((msg) => errorMessage.includes(msg))
    );
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        if (this.isNetworkError(error)) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(
            `Retrying Firebase operation in ${delay}ms... (attempt ${
              attempt + 1
            }/${maxRetries + 1})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Non-network error, don't retry
          throw error;
        }
      }
    }

    throw lastError;
  }
}

// Initialize network monitoring
window.addEventListener("online", async () => {
  console.log("Network connection restored");
  try {
    await enableNetwork(db);
    isFirebaseOnline = true;
    FirebaseNetworkManager["retryAttempts"] = 0;
    FirebaseNetworkManager["retryDelay"] = 1000;
  } catch (error) {
    console.error("Failed to re-enable Firebase network:", error);
  }
});

window.addEventListener("offline", () => {
  console.log("Network connection lost");
  isFirebaseOnline = false;
});

export default app;
