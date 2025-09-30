import type { User as FirebaseUser } from "firebase/auth";
import { User } from "lucide-react";
import { cn } from "../../../lib/utils";
import { studyAvatars } from "../utils/constants";

interface UserAvatarProps {
  user: FirebaseUser;
  className?: string;
  selectedAvatar?: string; // For immediate preview of selected avatar
}

export function UserAvatar({
  user,
  className = "w-20 h-20",
  selectedAvatar,
}: UserAvatarProps) {
  const getUserAvatar = () => {
    // Show selected avatar first (for immediate feedback)
    if (selectedAvatar) {
      const avatar = studyAvatars.find((a) => a.emoji === selectedAvatar);
      if (avatar) {
        return (
          <div
            className={cn(
              "w-full h-full rounded-full flex items-center justify-center text-white text-2xl",
              avatar.color
            )}
          >
            {avatar.emoji}
          </div>
        );
      }
    }

    if (user.photoURL) {
      // Check if it's a Google photo URL
      if (user.photoURL.includes("googleusercontent.com")) {
        return (
          <img
            src={user.photoURL}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
          />
        );
      }

      // Check if it's a data URL containing an emoji (our new format)
      if (user.photoURL.startsWith("data:text/plain")) {
        try {
          const emojiString = decodeURIComponent(user.photoURL.split(",")[1]);
          const avatar = studyAvatars.find((a) => a.emoji === emojiString);
          if (avatar) {
            return (
              <div
                className={cn(
                  "w-full h-full rounded-full flex items-center justify-center text-white text-2xl",
                  avatar.color
                )}
              >
                {avatar.emoji}
              </div>
            );
          }
        } catch (error) {
          console.error("Error parsing avatar data URL:", error);
        }
      }

      // Check if it's one of our study avatars (legacy format)
      const avatar = studyAvatars.find((a) => user.photoURL?.includes(a.emoji));
      if (avatar) {
        return (
          <div
            className={cn(
              "w-full h-full rounded-full flex items-center justify-center text-white text-2xl",
              avatar.color
            )}
          >
            {avatar.emoji}
          </div>
        );
      }
    }

    // Default avatar
    return (
      <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
    );
  };

  return <div className={className}>{getUserAvatar()}</div>;
}
