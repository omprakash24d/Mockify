import { Lock, User } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { ActiveTab } from "../types";

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "profile" as ActiveTab, label: "Profile", icon: User },
    { id: "password" as ActiveTab, label: "Security", icon: Lock },
  ];

  return (
    <div className="px-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div
        className="flex gap-1"
        role="tablist"
        aria-label="Profile settings navigation"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
                isActive
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
