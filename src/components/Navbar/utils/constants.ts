import { BarChart3, BookOpen, Brain, Home, Shield } from "lucide-react";
import type { NavItem } from "../types";

export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Home, current: true },
  { name: "NEET Questions", href: "/neet", icon: Brain },
  { name: "Create Test", href: "/create-test", icon: BookOpen },
  { name: "Test", href: "/test", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Admin", href: "/admin", icon: Shield },
];

export const NAV_ITEM_DESCRIPTIONS = {
  Dashboard: "Overview & insights",
  "NEET Questions": "Practice NEET questions",
  "Create Test": "Create & manage tests",
  Test: "Browse test library",
  Analytics: "Performance metrics",
  Admin: "Administration panel",
} as const;
