import { BarChart3, BookOpen, Home } from "lucide-react";
import type { NavItem } from "../types";

export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Home, current: true },
  { name: "Create Test", href: "/create-test", icon: BookOpen },
  { name: "Test", href: "/test", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export const NAV_ITEM_DESCRIPTIONS = {
  Dashboard: "Overview & insights",
  "Test Library": "Browse & create tests",
  Analytics: "Performance metrics",
} as const;
