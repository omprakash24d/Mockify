import { type User as FirebaseUser } from "firebase/auth";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useClickOutside } from "../hooks/useClickOutside";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { useNavigation } from "../hooks/useNavigation";
import { cn } from "../lib/utils";
import { ProfileManager } from "./ProfileManager";
import { ThemeToggle } from "./ThemeToggle";
import { Link } from "./ui/Link";

interface NavbarProps {
  user: FirebaseUser;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Home, current: true },
  { name: "Test Library", href: "/tests", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Use custom navigation hook for better route tracking
  const currentPath = useNavigation();

  const { logout } = useAuth();

  // Close menus when clicking outside
  const mobileMenuRef = useClickOutside<HTMLDivElement>(
    () => setIsMenuOpen(false),
    isMenuOpen
  );
  const profileMenuRef = useClickOutside<HTMLDivElement>(
    () => setIsProfileOpen(false),
    isProfileOpen
  );

  // Keyboard navigation for profile menu
  const profileKeyboardRef = useKeyboardNavigation({
    isOpen: isProfileOpen,
    onClose: () => setIsProfileOpen(false),
    trapFocus: true,
  });

  // Enhanced logout handler with user feedback
  const handleSignOut = useCallback(async () => {
    try {
      setLogoutError(null); // Clear any previous errors
      await logout();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign out";
      setLogoutError(errorMessage);
      console.error("Error signing out:", error);

      // Clear error after 5 seconds
      setTimeout(() => setLogoutError(null), 5000);
    }
  }, [logout]);

  // Memoized avatar component for better performance
  const getUserAvatar = useMemo(() => {
    if (user.photoURL) {
      // Check if it's a Google photo URL
      if (user.photoURL.includes("googleusercontent.com")) {
        return (
          <img
            src={user.photoURL}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-500/20 shadow-soft"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
            }}
          />
        );
      }

      // Check if it's one of our study avatars (emoji)
      // Enhanced regex pattern to match more emoji ranges
      const emojiPattern =
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      if (user.photoURL.match(emojiPattern)) {
        return (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-700 flex items-center justify-center text-lg shadow-soft ring-2 ring-primary-500/20">
            {user.photoURL}
          </div>
        );
      }
    }

    // Default avatar with improved styling
    return (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-700 flex items-center justify-center shadow-soft ring-2 ring-primary-500/20">
        <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }, [user.photoURL]);

  // Memoized enhanced navigation items for performance optimization
  const enhancedNavItems = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        active: currentPath === item.href,
      })),
    [currentPath]
  );

  // Improved user display name with fallback handling
  const userDisplayName = useMemo(() => {
    if (user.displayName?.trim()) {
      return user.displayName;
    }
    if (user.email) {
      const emailPart = user.email.split("@")[0];
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    return "User"; // Final fallback
  }, [user.displayName, user.email]);
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent transition-all duration-300">
                Mockify
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {enhancedNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    "hover:scale-105 active:scale-95",
                    item.active
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 shadow-soft"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                  aria-current={item.active ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle size="sm" variant="switch" />
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="max-w-xs flex items-center gap-3 text-sm rounded-xl transition-all duration-300 p-2 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-3 focus:ring-primary-500/20 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-soft hover:shadow-medium hover:scale-105 active:scale-95"
                  id="user-menu-button"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <span className="sr-only">Open user menu</span>
                  {getUserAvatar}
                  <span className="ml-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {userDisplayName}
                  </span>
                </button>{" "}
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div
                    ref={profileMenuRef}
                    className="origin-top-right absolute right-0 mt-3 w-56 rounded-2xl shadow-soft-xl ring-1 ring-black/5 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 animate-scale-in"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="py-2" ref={profileKeyboardRef}>
                      <div className="px-4 py-3 border-b border-neutral-200/50 dark:border-neutral-700/50">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {userDisplayName}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                          {user.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileManagerOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm transition-all duration-200 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl mx-2 my-1"
                        role="menuitem"
                        tabIndex={0}
                      >
                        <Settings className="mr-3 h-4 w-4" aria-hidden="true" />
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm transition-all duration-200 border-t border-neutral-200/50 dark:border-neutral-700/50 text-neutral-600 dark:text-neutral-300 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl mx-2 mt-2 mb-1"
                        role="menuitem"
                        tabIndex={0}
                      >
                        <LogOut className="mr-3 h-4 w-4" aria-hidden="true" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-neutral-100 dark:bg-neutral-800 inline-flex items-center justify-center p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-3 focus:ring-primary-500/20 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-all duration-200 shadow-soft hover:shadow-medium active:scale-95"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">
                {isMenuOpen ? "Close" : "Open"} main menu
              </span>
              {isMenuOpen ? (
                <X className="block h-5 w-5" />
              ) : (
                <Menu className="block h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden" ref={mobileMenuRef} id="mobile-menu">
          <div className="px-4 pt-4 pb-6 space-y-2 border-t bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50 animate-slide-down">
            {enhancedNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center gap-3",
                  item.active
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 shadow-soft"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
                onClick={() => setIsMenuOpen(false)}
                aria-current={item.active ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="border-t border-neutral-200/50 dark:border-neutral-700/50 pt-4 mt-4">
              <div className="flex items-center px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                {getUserAvatar}
                <div className="ml-3">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {userDisplayName}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 mt-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-all duration-200 rounded-xl"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Toast */}
      {logoutError && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-error-200 dark:border-error-800 rounded-2xl p-4 shadow-soft-xl animate-slide-down">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-error-100 dark:bg-error-900/50 flex items-center justify-center">
                <AlertCircle
                  className="h-4 w-4 text-error-600 dark:text-error-400"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-error-800 dark:text-error-200">
                Sign Out Error
              </h3>
              <div className="mt-1 text-sm text-error-700 dark:text-error-300">
                {logoutError}
              </div>
            </div>
            <div className="ml-2">
              <button
                onClick={() => setLogoutError(null)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-error-500 hover:bg-error-100 dark:hover:bg-error-900/50 focus:outline-none focus:ring-3 focus:ring-error-500/20 transition-all duration-200"
                aria-label="Dismiss error"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Manager Modal */}
      <ProfileManager
        user={user}
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
      />
    </nav>
  );
};
