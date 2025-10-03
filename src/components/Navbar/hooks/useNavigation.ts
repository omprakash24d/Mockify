import { useMemo } from "react";
import { useNavigation } from "../../../hooks/useNavigation";
import type { EnhancedNavItem } from "../types";
import { navItems } from "../utils/constants";

/**
 * Hook to get navigation items with current path tracking
 */
export const useEnhancedNavItems = (): EnhancedNavItem[] => {
  const currentPath = useNavigation();

  return useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        active: currentPath === item.href,
      })),
    [currentPath]
  );
};
