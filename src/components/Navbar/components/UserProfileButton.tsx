import { type User as FirebaseUser } from "firebase/auth";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useUserAvatar, useUserDisplayName } from "../hooks/useUserUtils";

interface UserProfileButtonProps {
  user: FirebaseUser;
  isProfileOpen: boolean;
  onClick: () => void;
}

export const UserProfileButton: React.FC<UserProfileButtonProps> = ({
  user,
  isProfileOpen,
  onClick,
}) => {
  const userAvatar = useUserAvatar(user);
  const userDisplayName = useUserDisplayName(user);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
        "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      )}
      id="user-menu-button"
      aria-expanded={isProfileOpen}
      aria-haspopup="true"
      aria-label="User menu"
    >
      <div className="relative">
        {userAvatar}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
      </div>

      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[100px]">
        {userDisplayName}
      </span>

      <ChevronDown
        className={cn(
          "w-4 h-4 text-gray-400 transition-transform duration-200",
          isProfileOpen && "rotate-180"
        )}
      />
    </button>
  );
};
