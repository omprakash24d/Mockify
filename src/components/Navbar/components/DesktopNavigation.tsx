import { cn } from "../../../lib/utils";
import { Link } from "../../ui/Link";
import { useEnhancedNavItems } from "../hooks/useNavigation";

export const DesktopNavigation: React.FC = () => {
  const enhancedNavItems = useEnhancedNavItems();

  return (
    <div className="hidden md:flex items-center">
      <div className="flex items-center space-x-1">
        {enhancedNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              "flex items-center gap-2.5 group overflow-hidden",
              "hover:scale-[1.02] active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
              item.active
                ? [
                    "text-blue-700 dark:text-blue-300",
                    "bg-blue-50/80 dark:bg-blue-900/30",
                    "shadow-sm border border-blue-200/50 dark:border-blue-800/50",
                    "backdrop-blur-sm",
                  ]
                : [
                    "text-gray-600 dark:text-gray-400",
                    "hover:text-gray-900 dark:hover:text-gray-100",
                    "hover:bg-gray-100/80 dark:hover:bg-gray-800/50",
                    "hover:shadow-sm hover:border hover:border-gray-200/50 dark:hover:border-gray-700/50",
                  ]
            )}
            aria-current={item.active ? "page" : undefined}
          >
            {/* Background glow effect for active item */}
            {item.active && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-xl" />
            )}

            {/* Icon with enhanced styling */}
            <item.icon
              className={cn(
                "h-4 w-4 transition-all duration-300 relative z-10",
                item.active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
              )}
              aria-hidden="true"
            />

            {/* Text with improved typography */}
            <span className="relative z-10 font-medium tracking-tight">
              {item.name}
            </span>

            {/* Active indicator */}
            {item.active && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
