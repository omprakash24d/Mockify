import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "../lib/utils";

interface NetworkStatusProps {
  className?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) setShowStatus(true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white transition-all",
        isOnline ? "bg-green-500" : "bg-red-500",
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Connection restored</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Working offline</span>
        </>
      )}
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
}

export class NetworkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, isNetworkError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const isNetworkError =
      error.message.includes("network-request-failed") ||
      error.message.includes("ERR_INTERNET_DISCONNECTED") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("client is offline");

    return { hasError: true, error, isNetworkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isNetwork = this.state.isNetworkError;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 mx-auto rounded-full",
              isNetwork
                ? "bg-yellow-100 dark:bg-yellow-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            )}
          >
            <AlertCircle
              className={cn(
                "w-6 h-6",
                isNetwork
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              )}
            />
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isNetwork ? "Connection Issue" : "Something went wrong"}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isNetwork
                ? "Unable to connect to our services. Please check your internet connection and try again."
                : "An unexpected error occurred. Please refresh the page to continue."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              {isNetwork ? "Try Again" : "Refresh Page"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
