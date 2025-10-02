import { useMemo } from "react";
import { useNavigation } from "../../../hooks/useNavigation";
import { useIsAdmin } from "../../../middleware/adminAuth";
import type { EnhancedNavItem } from "../types";
import { navItems } from "../utils/constants";

/**
 * Hook to get navigation items with current path tracking
 */
export const useEnhancedNavItems = (): EnhancedNavItem[] => {
  const currentPath = useNavigation();
  const isAdmin = useIsAdmin();

  return useMemo(
    () =>
      navItems
        .filter((item) => {
          // Hide admin route if user is not admin
          if (item.href === "/admin" && !isAdmin) {
            return false;
          }
          return true;
        })
        .map((item) => ({
          ...item,
          active: currentPath === item.href,
        })),
    [currentPath, isAdmin]
  );
};
