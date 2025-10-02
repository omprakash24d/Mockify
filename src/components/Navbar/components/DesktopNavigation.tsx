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
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
            item.active
              ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
          )}
          aria-current={item.active ? "page" : undefined}
        >
          <item.icon
            className={cn(
              "w-4 h-4",
              item.active
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-500"
            )}
            aria-hidden="true"
          />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};
