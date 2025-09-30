import { Lock, User } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { cn } from "../../../lib/utils";
import type { ActiveTab } from "../types";

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { classes } = useTheme();

  const tabs = [
    {
      id: "profile" as ActiveTab,
      label: "Profile",
      icon: User,
      description: "Personal information",
    },
    {
      id: "password" as ActiveTab,
      label: "Security",
      icon: Lock,
      description: "Password & security",
    },
  ];

  return (
    <div className={`px-6 sm:px-8 ${classes.bg.secondary}`}>
      {/* Enhanced tab navigation with modern styling */}
      <div
        className="flex space-x-1 p-1 rounded-2xl bg-gray-100 dark:bg-gray-700/50"
        role="tablist"
        aria-label="Profile settings navigation"
        style={{ pointerEvents: "auto" }}
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
                "relative flex-1 flex items-center justify-center px-4 py-3 rounded-xl",
                "text-sm font-semibold transition-all duration-300 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "dark:focus:ring-offset-gray-800",
                "group overflow-hidden cursor-pointer z-10",
                isActive
                  ? `${classes.bg.elevated} ${classes.text.primary} shadow-soft transform scale-[1.02]`
                  : `${classes.text.secondary} hover:${classes.text.primary} hover:bg-white/60 dark:hover:bg-gray-600/60`
              )}
            >
              {/* Background gradient for active tab */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 pointer-events-none" />
              )}

              {/* Tab content */}
              <div className="relative flex items-center space-x-2">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-all duration-300",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 scale-110"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                  )}
                />
                <div className="flex flex-col items-start">
                  <span className="leading-none">{tab.label}</span>
                  {isActive && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-none">
                      {tab.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
