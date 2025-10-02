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
      <ThemeToggle size="sm" variant="switch" />
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center p-2.5 rounded-xl transition-all duration-300",
          "bg-gray-100/80 dark:bg-gray-800/50",
          "border border-gray-200/50 dark:border-gray-700/50",
          "text-gray-600 dark:text-gray-400",
          "hover:text-gray-900 dark:hover:text-gray-100",
          "hover:bg-gray-200/80 dark:hover:bg-gray-700/60",
          "hover:border-gray-300/60 dark:hover:border-gray-600/60",
          "hover:shadow-md hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
          "backdrop-blur-sm"
        )}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
      >
        <span className="sr-only">
          {isMenuOpen ? "Close" : "Open"} main menu
        </span>
        {isMenuOpen ? (
          <X className="block h-5 w-5" />
        ) : (
          <Menu className="block h-5 w-5" />
        )}
      </button>
    </div>
  );
};
