import { useEffect, useState } from "react";
import { FirebaseNetworkManager, isFirebaseOnline } from "../lib/firebase";

export interface NetworkState {
  isOnline: boolean;
  isFirebaseOnline: boolean;
  isConnecting: boolean;
  lastError: Error | null;
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    isFirebaseOnline: isFirebaseOnline,
    isConnecting: false,
    lastError: null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setNetworkState((prev) => ({
        ...prev,
        isOnline: true,
        isConnecting: true,
      }));

      // Give Firebase a moment to reconnect
      setTimeout(() => {
        setNetworkState((prev) => ({
          ...prev,
          isFirebaseOnline: isFirebaseOnline,
          isConnecting: false,
        }));
      }, 1000);
    };

    const handleOffline = () => {
      setNetworkState((prev) => ({
        ...prev,
        isOnline: false,
        isFirebaseOnline: false,
        isConnecting: false,
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic Firebase status check
    const checkFirebaseStatus = () => {
      const currentFirebaseStatus = isFirebaseOnline;
      setNetworkState((prev) => {
        if (prev.isFirebaseOnline !== currentFirebaseStatus) {
          return {
            ...prev,
            isFirebaseOnline: currentFirebaseStatus,
          };
        }
        return prev;
      });
    };

    const interval = setInterval(checkFirebaseStatus, 3000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const retryConnection = async () => {
    setNetworkState((prev) => ({
      ...prev,
      isConnecting: true,
      lastError: null,
    }));

    try {
      const isNetworkAvailable =
        await FirebaseNetworkManager.checkNetworkConnectivity();

      setNetworkState((prev) => ({
        ...prev,
        isOnline: isNetworkAvailable,
        isFirebaseOnline: isNetworkAvailable && isFirebaseOnline,
        isConnecting: false,
      }));
    } catch (error) {
      setNetworkState((prev) => ({
        ...prev,
        isConnecting: false,
        lastError: error as Error,
      }));
    }
  };

  return {
    ...networkState,
    retryConnection,
  };
};

export default useNetworkStatus;
