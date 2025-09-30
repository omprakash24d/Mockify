// Main Navbar component
export { Navbar } from "./index";

// Component exports
export { DesktopNavigation } from "./components/DesktopNavigation";
export { ErrorToast } from "./components/ErrorToast";
export { Logo } from "./components/Logo";
export { MobileMenuButton } from "./components/MobileMenuButton";
export { MobileNavigation } from "./components/MobileNavigation";
export { ProfileDropdown } from "./components/ProfileDropdown";
export { UserControls } from "./components/UserControls";
export { UserProfileButton } from "./components/UserProfileButton";

// Hook exports
export { useLogoutHandler } from "./hooks/useLogoutHandler";
export { useEnhancedNavItems } from "./hooks/useNavigation";
export { useUserAvatar, useUserDisplayName } from "./hooks/useUserUtils";

// Type exports
export type {
  EnhancedNavItem,
  NavItem,
  NavItemActions,
  NavItemStates,
  NavbarProps,
} from "./types";

// Utility exports
export { NAV_ITEM_DESCRIPTIONS, navItems } from "./utils/constants";
