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
        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300",
        "bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50",
        "hover:bg-gray-100/80 dark:hover:bg-gray-700/60",
        "hover:border-gray-300/60 dark:hover:border-gray-600/60",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        "backdrop-blur-sm group"
      )}
      id="user-menu-button"
      aria-expanded={isProfileOpen}
      aria-haspopup="true"
      aria-label="User menu"
    >
      <span className="sr-only">Open user menu</span>

      {/* Enhanced Avatar */}
      <div className="relative">
        {userAvatar}
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse" />
      </div>

      {/* User Name with improved typography */}
      <div className="flex flex-col items-start min-w-0">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
          {userDisplayName}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[120px]">
          {user.email?.split("@")[0]}
        </span>
      </div>

      {/* Dropdown Arrow */}
      <ChevronDown
        className={cn(
          "h-4 w-4 text-gray-400 dark:text-gray-600 transition-transform duration-200",
          isProfileOpen && "rotate-180"
        )}
      />
    </button>
  );
};
