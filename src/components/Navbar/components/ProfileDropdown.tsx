import { type User as FirebaseUser } from "firebase/auth";
import { LogOut, Settings } from "lucide-react";
import type { RefObject } from "react";
import { cn } from "../../../lib/utils";
import { useUserAvatar, useUserDisplayName } from "../hooks/useUserUtils";

interface ProfileDropdownProps {
  user: FirebaseUser;
  isOpen: boolean;
  profileMenuRef: RefObject<HTMLDivElement | null>;
  profileKeyboardRef: RefObject<HTMLDivElement | null>;
  onProfileSettings: () => void;
  onSignOut: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  isOpen,
  profileMenuRef,
  profileKeyboardRef,
  onProfileSettings,
  onSignOut,
}) => {
  const userAvatar = useUserAvatar(user);
  const userDisplayName = useUserDisplayName(user);

  if (!isOpen) return null;

  return (
    <div
      ref={profileMenuRef}
      className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg animate-scale-in"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button"
    >
      <div className="p-2" ref={profileKeyboardRef}>
        {/* User Info */}
        <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              {userAvatar}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                {userDisplayName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={onProfileSettings}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition",
              "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              "focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800"
            )}
            role="menuitem"
            tabIndex={0}
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            <span className="font-medium">Profile Settings</span>
          </button>

          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

          <button
            onClick={onSignOut}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition",
              "text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20",
              "focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
            )}
            role="menuitem"
            tabIndex={0}
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
