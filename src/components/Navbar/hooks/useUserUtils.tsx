import { type User as FirebaseUser } from "firebase/auth";
import { User } from "lucide-react";
import { useMemo } from "react";

/**
 * Hook to get user display name with fallback handling
 */
export const useUserDisplayName = (user: FirebaseUser) => {
  return useMemo(() => {
    if (user.displayName?.trim()) {
      return user.displayName;
    }
    if (user.email) {
      const emailPart = user.email.split("@")[0];
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    return "User"; // Final fallback
  }, [user.displayName, user.email]);
};

/**
 * Hook to generate user avatar component
 */
export const useUserAvatar = (user: FirebaseUser) => {
  return useMemo(() => {
    if (user.photoURL) {
      // Check if it's a Google photo URL
      if (user.photoURL.includes("googleusercontent.com")) {
        return (
          <img
            src={user.photoURL}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20 shadow-lg"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
            }}
          />
        );
      }

      // Check if it's a data URL containing an emoji (our new format)
      if (user.photoURL.startsWith("data:text/plain")) {
        try {
          const emojiString = decodeURIComponent(user.photoURL.split(",")[1]);
          return (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 flex items-center justify-center text-lg shadow-lg ring-2 ring-blue-500/20">
              {emojiString}
            </div>
          );
        } catch (error) {
          console.error("Error parsing avatar data URL:", error);
        }
      }

      // Check if it's one of our study avatars (emoji) - legacy format
      // Enhanced regex pattern to match more emoji ranges
      const emojiPattern =
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      if (user.photoURL.match(emojiPattern)) {
        return (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 flex items-center justify-center text-lg shadow-lg ring-2 ring-blue-500/20">
            {user.photoURL}
          </div>
        );
      }
    }

    // Default avatar with proper dark mode support
    return (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }, [user.photoURL]);
};
