import { cn } from "../../../lib/utils";
import { Link } from "../../ui/Link";
import { useEnhancedNavItems } from "../hooks/useNavigation";

export const DesktopNavigation: React.FC = () => {
  const enhancedNavItems = useEnhancedNavItems();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {enhancedNavItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
            item.active
              ? "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 shadow-sm"
              : "text-blue-700 dark:text-blue-200 hover:text-blue-800 dark:hover:text-blue-100 hover:bg-blue-100/50 dark:hover:bg-blue-800/20"
          )}
          aria-current={item.active ? "page" : undefined}
        >
          <item.icon
            className={cn(
              "w-4 h-4",
              item.active
                ? "text-blue-700 dark:text-blue-300"
                : "text-blue-600 dark:text-blue-300"
            )}
            aria-hidden="true"
          />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};
