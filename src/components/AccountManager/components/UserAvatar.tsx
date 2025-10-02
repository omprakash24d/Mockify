import type { User as FirebaseUser } from "firebase/auth";
import { User } from "lucide-react";
import { cn } from "../../../lib/utils";
import { STUDY_AVATARS } from "../utils/constants";

interface UserAvatarProps {
  user: FirebaseUser;
  className?: string;
  selectedAvatar?: string;
}

export function UserAvatar({
  user,
  className = "w-20 h-20",
  selectedAvatar,
}: UserAvatarProps) {
  const renderEmojiAvatar = (emoji: string) => {
    const avatar = STUDY_AVATARS.find((a) => a.emoji === emoji);
    if (!avatar) return null;

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
  };

  const getUserAvatar = () => {
    // Show selected avatar for immediate feedback
    if (selectedAvatar) {
      const avatar = renderEmojiAvatar(selectedAvatar);
      if (avatar) return avatar;
    }

    if (user.photoURL) {
      // Google photo URL
      if (user.photoURL.includes("googleusercontent.com")) {
        return (
          <img
            src={user.photoURL}
            alt={user.displayName || "Profile"}
            className="w-full h-full rounded-full object-cover"
          />
        );
      }

      // Data URL with emoji
      if (user.photoURL.startsWith("data:text/plain")) {
        try {
          const emoji = decodeURIComponent(user.photoURL.split(",")[1]);
          const avatar = renderEmojiAvatar(emoji);
          if (avatar) return avatar;
        } catch (error) {
          console.error("Error parsing avatar:", error);
        }
      }

      // Legacy emoji format
      const avatar = STUDY_AVATARS.find((a) =>
        user.photoURL?.includes(a.emoji)
      );
      if (avatar) return renderEmojiAvatar(avatar.emoji);
    }

    // Default fallback
    return (
      <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
    );
  };

  return <div className={className}>{getUserAvatar()}</div>;
}
