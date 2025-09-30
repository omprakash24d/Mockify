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
      className={cn(
        "absolute right-0 mt-4 w-72 origin-top-right z-50",
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
        "border border-gray-200/50 dark:border-gray-800/50",
        "rounded-2xl shadow-soft-xl",
        "animate-scale-in"
      )}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button"
    >
      <div className="p-2" ref={profileKeyboardRef}>
        {/* User Info Header */}
        <div className="px-4 py-4 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              {userAvatar}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {userDisplayName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2 space-y-1">
          <button
            onClick={onProfileSettings}
            className={cn(
              "flex items-center w-full px-4 py-3 text-sm transition-all duration-200",
              "text-gray-700 dark:text-gray-300",
              "hover:text-gray-900 dark:hover:text-gray-100",
              "hover:bg-gray-100/80 dark:hover:bg-gray-800/50",
              "rounded-xl group focus:outline-none focus:bg-gray-100/80 dark:focus:bg-gray-800/50"
            )}
            role="menuitem"
            tabIndex={0}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-200">
              <Settings className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Profile Settings</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Manage your account
              </div>
            </div>
          </button>

          <div className="px-2 py-1">
            <div className="border-t border-gray-200/50 dark:border-gray-700/50"></div>
          </div>

          <button
            onClick={onSignOut}
            className={cn(
              "flex items-center w-full px-4 py-3 text-sm transition-all duration-200",
              "text-gray-700 dark:text-gray-300",
              "hover:text-red-600 dark:hover:text-red-400",
              "hover:bg-red-50/80 dark:hover:bg-red-900/20",
              "rounded-xl group focus:outline-none focus:bg-red-50/80 dark:focus:bg-red-900/20"
            )}
            role="menuitem"
            tabIndex={0}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors duration-200">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Sign Out</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Log out of your account
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
