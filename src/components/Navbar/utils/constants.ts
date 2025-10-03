import { BookOpen, Home, Shield, User } from "lucide-react";
import type { NavItem } from "../types";

export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Home, current: true },
  { name: "Create Test", href: "/create-test", icon: BookOpen },
  { name: "Student", href: "/student", icon: User },
  { name: "Admin", href: "/admin", icon: Shield },
];

export const NAV_ITEM_DESCRIPTIONS = {
  Dashboard: "Overview & insights",
  "Create Test": "Create & manage tests",
  Student: "Student test interface",
  Admin: "Administration panel",
} as const;
