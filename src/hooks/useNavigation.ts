import { useLocation } from "react-router-dom";

/**
 * Custom hook for tracking current path using React Router
 * Works seamlessly with React Router's navigation system
 */
export const useNavigation = () => {
  const location = useLocation();
  return location.pathname;
};

/**
 * @deprecated Use React Router's useNavigate hook instead
 * Utility function to navigate programmatically
 * This is kept for backward compatibility but should be replaced with useNavigate
 */
export const navigateTo = (path: string, replace = false) => {
  console.warn(
    "navigateTo is deprecated. Use React Router's useNavigate hook instead."
  );
  if (replace) {
    window.history.replaceState(null, "", path);
    window.dispatchEvent(new Event("replacestate"));
  } else {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("pushstate"));
  }
};
