import { type User as FirebaseUser } from "firebase/auth";
import type { RefObject } from "react";
import { ThemeToggle } from "../../ui/ThemeToggle";
import { ProfileDropdown } from "./ProfileDropdown";
import { UserProfileButton } from "./UserProfileButton";

interface UserControlsProps {
  user: FirebaseUser;
  isProfileOpen: boolean;
  profileMenuRef: RefObject<HTMLDivElement | null>;
  profileKeyboardRef: RefObject<HTMLDivElement | null>;
  onProfileToggle: () => void;
  onProfileSettings: () => void;
  onSignOut: () => void;
}

export const UserControls: React.FC<UserControlsProps> = ({
  user,
  isProfileOpen,
  profileMenuRef,
  profileKeyboardRef,
  onProfileToggle,
  onProfileSettings,
  onSignOut,
}) => {
  return (
    <div className="hidden md:flex items-center gap-3">
      {/* Theme Toggle */}
      <ThemeToggle size="sm" />

      {/* Separator */}
      <div className="h-6 w-px bg-blue-300 dark:bg-blue-600" />

      {/* User Profile */}
      <div className="relative">
        <UserProfileButton
          user={user}
          isProfileOpen={isProfileOpen}
          onClick={onProfileToggle}
        />

        <ProfileDropdown
          user={user}
          isOpen={isProfileOpen}
          profileMenuRef={profileMenuRef}
          profileKeyboardRef={profileKeyboardRef}
          onProfileSettings={() => {
            onProfileSettings();
            onProfileToggle();
          }}
          onSignOut={() => {
            onSignOut();
            onProfileToggle();
          }}
        />
      </div>
    </div>
  );
};
