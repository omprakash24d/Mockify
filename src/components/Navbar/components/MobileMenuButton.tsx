import { Menu, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ThemeToggle } from "../../ui/ThemeToggle";

interface MobileMenuButtonProps {
  isMenuOpen: boolean;
  onClick: () => void;
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isMenuOpen,
  onClick,
}) => {
  return (
    <div className="md:hidden flex items-center gap-2">
      <ThemeToggle size="sm" />
      <button
        onClick={onClick}
        className={cn(
          "p-2.5 rounded-lg transition",
          "bg-gray-100 dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700",
          "text-gray-600 dark:text-gray-400",
          "hover:text-gray-900 dark:hover:text-gray-100",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-500"
        )}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
      >
        {isMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
