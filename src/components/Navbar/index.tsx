import { useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { ProfileManager } from "../AccountManager";
import { DesktopNavigation } from "./components/DesktopNavigation";
import { ErrorToast } from "./components/ErrorToast";
import { Logo } from "./components/Logo";
import { MobileMenuButton } from "./components/MobileMenuButton";
import { MobileNavigation } from "./components/MobileNavigation";
import { TopBanner } from "./components/TopBanner";
import { UserControls } from "./components/UserControls";
import { useLogoutHandler } from "./hooks/useLogoutHandler";
import type { NavbarProps } from "./types";

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Custom hooks
  const handleSignOut = useLogoutHandler(setLogoutError);

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

  return (
    <>
      {/* Top Banner - Fixed at very top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBanner />
      </div>

      {/* Professional Unified Navbar - Below banner */}
      <nav
        className="fixed left-0 right-0 z-50 bg-blue-50/95 dark:bg-blue-900/95 border-b border-blue-200 dark:border-blue-700 shadow-sm navbar-blur"
        style={{ top: "40px" }}
      >
        {/* Main Navigation Container */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo Section */}
            <Logo />

            {/* Desktop Navigation */}
            <DesktopNavigation />

            {/* User Controls */}
            <UserControls
              user={user}
              isProfileOpen={isProfileOpen}
              profileMenuRef={profileMenuRef}
              profileKeyboardRef={profileKeyboardRef}
              onProfileToggle={() => setIsProfileOpen(!isProfileOpen)}
              onProfileSettings={() => setIsProfileManagerOpen(true)}
              onSignOut={handleSignOut}
            />

            {/* Mobile Menu Button */}
            <MobileMenuButton
              isMenuOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation
          user={user}
          isMenuOpen={isMenuOpen}
          mobileMenuRef={mobileMenuRef}
          onMenuClose={() => setIsMenuOpen(false)}
          onProfileSettings={() => setIsProfileManagerOpen(true)}
          onSignOut={handleSignOut}
        />
      </nav>

      {/* Error Toast */}
      <ErrorToast error={logoutError} onDismiss={() => setLogoutError(null)} />

      {/* Profile Manager Modal */}
      <ProfileManager
        user={user}
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
      />
    </>
  );
};
