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
    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
    "bg-blue-700/30 border border-blue-400/20",
    "hover:bg-blue-700/40 hover:border-blue-400/30",
    "focus:outline-none focus:ring-2 focus:ring-blue-300/50"
  )}
  id="user-menu-button"
  aria-expanded={isProfileOpen}
  aria-haspopup="true"
  aria-label="User menu"
>
  <div className="relative">
    {userAvatar}
    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full shadow-sm" />
  </div>

  <span className="text-sm font-medium text-white truncate max-w-[100px]">
    {userDisplayName}
  </span>

  <ChevronDown
    className={cn(
      "w-4 h-4 text-blue-200 transition-transform duration-200",
      isProfileOpen && "rotate-180"
    )}
  />
</button>

  );
};
