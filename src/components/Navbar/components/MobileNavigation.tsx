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
    <div
      className="md:hidden border-t border-gray-200/30 dark:border-gray-800/30"
      ref={mobileMenuRef}
      id="mobile-menu"
    >
      <div
        className={cn(
          "px-4 pt-6 pb-8 space-y-3",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
          "animate-slide-down"
        )}
      >
        {/* Mobile Navigation Items */}
        {enhancedNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              item.active
                ? [
                    "text-blue-700 dark:text-blue-300",
                    "bg-blue-50/80 dark:bg-blue-900/30",
                    "border border-blue-200/50 dark:border-blue-800/50",
                    "shadow-sm",
                  ]
                : [
                    "text-gray-700 dark:text-gray-300",
                    "hover:text-gray-900 dark:hover:text-gray-100",
                    "hover:bg-gray-100/80 dark:hover:bg-gray-800/50",
                    "hover:shadow-sm",
                  ]
            )}
            onClick={onMenuClose}
            aria-current={item.active ? "page" : undefined}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                item.active
                  ? "bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">
                {item.name === "Dashboard" && "Overview & insights"}
                {item.name === "Test Library" && "Browse & create tests"}
                {item.name === "Analytics" && "Performance metrics"}
              </div>
            </div>
          </Link>
        ))}

        {/* Mobile User Section */}
        <div className="pt-6 mt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 mb-4">
            <div className="relative">
              {userAvatar}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {userDisplayName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                onProfileSettings();
                onMenuClose();
              }}
              className={cn(
                "flex items-center w-full p-4 rounded-2xl transition-all duration-300",
                "text-gray-700 dark:text-gray-300",
                "hover:text-gray-900 dark:hover:text-gray-100",
                "hover:bg-gray-100/80 dark:hover:bg-gray-800/50",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4">
                <Settings className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Profile Settings</div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Manage your account
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onSignOut();
                onMenuClose();
              }}
              className={cn(
                "flex items-center w-full p-4 rounded-2xl transition-all duration-300",
                "text-gray-700 dark:text-gray-300",
                "hover:text-red-600 dark:hover:text-red-400",
                "hover:bg-red-50/80 dark:hover:bg-red-900/20",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Sign Out</div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Log out of your account
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
