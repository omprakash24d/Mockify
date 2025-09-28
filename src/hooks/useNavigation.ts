import { useEffect, useState } from "react";

/**
 * Custom hook for tracking current path changes in single-page applications
 * Listens to both browser navigation events and programmatic navigation
 */
export const useNavigation = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const updateCurrentPath = () => {
      setCurrentPath(window.location.pathname);
    };

    // Set initial path
    updateCurrentPath();

    // Listen for browser back/forward navigation
    window.addEventListener("popstate", updateCurrentPath);

    // Listen for programmatic navigation (custom events)
    window.addEventListener("pushstate", updateCurrentPath);
    window.addEventListener("replacestate", updateCurrentPath);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("popstate", updateCurrentPath);
      window.removeEventListener("pushstate", updateCurrentPath);
      window.removeEventListener("replacestate", updateCurrentPath);
    };
  }, []);

  return currentPath;
};

/**
 * Utility function to navigate programmatically while triggering navigation events
 * This ensures the navigation hook picks up the route change
 */
export const navigateTo = (path: string, replace = false) => {
  if (replace) {
    window.history.replaceState(null, "", path);
    window.dispatchEvent(new Event("replacestate"));
  } else {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("pushstate"));
  }
};
