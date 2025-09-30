import { type User as FirebaseUser } from "firebase/auth";

export interface NavbarProps {
  user: FirebaseUser;
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

export interface EnhancedNavItem extends NavItem {
  active: boolean;
}

export interface NavItemStates {
  isMenuOpen: boolean;
  isProfileOpen: boolean;
  isProfileManagerOpen: boolean;
  logoutError: string | null;
}

export interface NavItemActions {
  setIsMenuOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  setIsProfileManagerOpen: (open: boolean) => void;
  setLogoutError: (error: string | null) => void;
  handleSignOut: () => Promise<void>;
}
