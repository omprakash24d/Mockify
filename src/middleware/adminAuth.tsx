import React from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * HOC to protect admin routes - only allows admin users
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if user has admin role
  // You can customize this based on your user role system
  const isAdmin = checkUserRole(user);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You don't have permission to access the admin panel.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Check if user has admin role
 * Customize this function based on your user role system
 */
function checkUserRole(user: any): boolean {
  // Method 1: Check custom claims (recommended for Firebase)
  if (user.customClaims?.role === "admin") {
    return true;
  }

  // Method 2: Check specific admin emails (for development/small teams)
  const adminEmails = [
    "admin@mockify.com",
    "omprakash24d@gmail.com", // Add your admin email
    // Add more admin emails as needed
  ];

  if (adminEmails.includes(user.email)) {
    return true;
  }

  // Method 3: Check Firebase Auth custom claims
  // This requires setting up custom claims in your Firebase project
  try {
    // You can get custom claims like this if they're available
    const token = user.accessToken;
    if (token) {
      // Decode token to check claims (in production, validate on backend)
      const claims = JSON.parse(atob(token.split(".")[1]));
      return claims.admin === true || claims.role === "admin";
    }
  } catch (error) {
    console.error("Error checking custom claims:", error);
  }

  // Method 4: Check Firestore user document (requires additional API call)
  // This would require creating a hook to fetch user role from Firestore

  return false;
}

/**
 * Hook to check if current user is admin
 */
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user ? checkUserRole(user) : false;
};

export default AdminRoute;
