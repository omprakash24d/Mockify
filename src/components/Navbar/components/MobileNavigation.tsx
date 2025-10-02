import { type User as FirebaseUser } from "firebase/auth";
import { LogOut, Settings } from "lucide-react";
import type { RefObject } from "react";
import { cn } from "../../../lib/utils";
import { Link } from "../../ui/Link";
import { useEnhancedNavItems } from "../hooks/useNavigation";
import { useUserAvatar, useUserDisplayName } from "../hooks/useUserUtils";

interface MobileNavigationProps {
  user: FirebaseUser;
  isMenuOpen: boolean;
  mobileMenuRef: RefObject<HTMLDivElement | null>;
  onMenuClose: () => void;
  onProfileSettings: () => void;
  onSignOut: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  user,
  isMenuOpen,
  mobileMenuRef,
  onMenuClose,
  onProfileSettings,
  onSignOut,
}) => {
  const enhancedNavItems = useEnhancedNavItems();
  const userAvatar = useUserAvatar(user);
  const userDisplayName = useUserDisplayName(user);

  if (!isMenuOpen) return null;

  return (
    <nav
      className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      ref={mobileMenuRef}
      id="mobile-menu"
    >
      <div className="px-4 py-6 space-y-2">
        {/* Navigation Items */}
        {enhancedNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition",
              item.active
                ? "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            )}
            onClick={onMenuClose}
            aria-current={item.active ? "page" : undefined}
          >
            <item.icon className="w-5 h-5" aria-hidden="true" />
            <span>{item.name}</span>
          </Link>
        ))}

        {/* User Section */}
        <div className="pt-6 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="relative">
              {userAvatar}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {userDisplayName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => {
              onProfileSettings();
              onMenuClose();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Profile Settings</span>
          </button>

          <button
            onClick={() => {
              onSignOut();
              onMenuClose();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
