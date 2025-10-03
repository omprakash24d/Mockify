import {
  AlertCircle,
  Bookmark,
  CheckCircle,
  type LucideIcon,
  TrendingUp,
} from "lucide-react";
import React from "react";

interface Action {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
  darkColor: string;
  href: string;
  ariaLabel: string;
}

interface QuickActionsSidebarProps {
  className?: string;
  onActionClick?: (action: string) => void;
}

// Memoized action item component for performance
const ActionItem = React.memo<{
  action: Action;
  isActive: boolean;
  onClick?: (label: string) => void;
}>(({ action, isActive, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(action.label);
    }
  };

  return (
    <a
      href={action.href}
      onClick={handleClick}
      className={`
        flex flex-col items-center p-1.5 rounded-md 
        transition-all duration-200 group
        hover:bg-gray-50 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        ${isActive ? "bg-gray-100 dark:bg-gray-800" : ""}
      `}
      aria-label={action.ariaLabel}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      <div
        className={`
          p-1 rounded-md mb-1 
          transition-all duration-200
          group-hover:scale-110 group-hover:shadow-md
          group-focus:scale-110
          ${action.color} dark:${action.darkColor}
        `}
        aria-hidden="true"
      >
        <action.icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
        {action.label}
      </span>
      <span
        className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5"
        aria-label={`${action.count} items`}
      >
        {action.count}
      </span>

      {/* Tooltip */}
      <span
        className="
          absolute right-full mr-2 px-2 py-1 
          bg-gray-900 dark:bg-gray-700 text-white text-xs rounded 
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-200 pointer-events-none
          whitespace-nowrap shadow-lg
        "
        role="tooltip"
      >
        {action.label}: {action.count}
      </span>
    </a>
  );
});

ActionItem.displayName = "ActionItem";

export const QuickActionsSidebar: React.FC<QuickActionsSidebarProps> =
  React.memo(({ className = "", onActionClick }) => {
    const [activeAction, setActiveAction] = React.useState<string | null>(null);
    const [isVisible, setIsVisible] = React.useState(true);

    const actions: Action[] = [
      {
        icon: Bookmark,
        label: "Bookmarked",
        count: 12,
        color: "text-blue-600 bg-blue-50",
        darkColor: "text-blue-400 bg-blue-900/30",
        href: "#bookmarks",
        ariaLabel: "View 12 bookmarked questions",
      },
      {
        icon: AlertCircle,
        label: "Incorrect",
        count: 8,
        color: "text-red-600 bg-red-50",
        darkColor: "text-red-400 bg-red-900/30",
        href: "#incorrect",
        ariaLabel: "View 8 incorrect answers",
      },
      {
        icon: CheckCircle,
        label: "Correct",
        count: 25,
        color: "text-green-600 bg-green-50",
        darkColor: "text-green-400 bg-green-900/30",
        href: "#correct",
        ariaLabel: "View 25 correct answers",
      },
      {
        icon: TrendingUp,
        label: "Progress",
        count: 78,
        color: "text-purple-600 bg-purple-50",
        darkColor: "text-purple-400 bg-purple-900/30",
        href: "#progress",
        ariaLabel: "View progress at 78 percent",
      },
    ];

    const handleActionClick = (label: string) => {
      setActiveAction(label);
      onActionClick?.(label);
    };

    // Hide sidebar on scroll (optional enhancement)
    React.useEffect(() => {
      let lastScrollY = window.scrollY;

      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        // Show when scrolling up, hide when scrolling down
        if (currentScrollY < lastScrollY || currentScrollY < 100) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 300) {
          setIsVisible(false);
        }

        lastScrollY = currentScrollY;
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <aside
        className={`
        hidden lg:block fixed right-3 top-1/2 z-40
        transform -translate-y-1/2
        transition-all duration-300 ease-in-out
        ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }
        ${className}
      `}
        role="complementary"
        aria-label="Quick actions navigation"
      >
        <nav
          className="
          bg-white dark:bg-gray-900 
          rounded-md shadow-lg dark:shadow-gray-950/50
          border border-gray-200 dark:border-gray-700 
          p-2 space-y-2 w-24
          backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95
        "
          aria-label="Question filters and statistics"
        >
          <h3
            className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center mb-2 px-1"
            id="quick-actions-title"
          >
            Quick Actions
          </h3>

          <ul
            className="space-y-1.5"
            role="list"
            aria-labelledby="quick-actions-title"
          >
            {actions.map((action) => (
              <li key={action.label} className="relative">
                <ActionItem
                  action={action}
                  isActive={activeAction === action.label}
                  onClick={handleActionClick}
                />
              </li>
            ))}
          </ul>

          {/* Optional: Add a collapse button */}
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="
            w-full pt-2 mt-2 border-t border-gray-200 dark:border-gray-700
            text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
            transition-colors
          "
            aria-label={isVisible ? "Hide quick actions" : "Show quick actions"}
          >
            {isVisible ? "›" : "‹"}
          </button>
        </nav>
      </aside>
    );
  });

QuickActionsSidebar.displayName = "QuickActionsSidebar";
