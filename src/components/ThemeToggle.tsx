import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "switch";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = "md",
  variant = "button",
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleToggle = () => {
    toggleTheme();
  };

  const sizeClasses = {
    sm: variant === "switch" ? "w-10 h-6" : "w-8 h-8",
    md: variant === "switch" ? "w-12 h-7" : "w-10 h-10",
    lg: variant === "switch" ? "w-14 h-8" : "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (variant === "switch") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          // Base styles
          "relative rounded-full p-1 transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:ring-offset-2",
          "dark:focus:ring-offset-gray-900",

          // Switch background
          isDark
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-300 hover:bg-gray-400",

          // Size
          sizeClasses[size],

          className
        )}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        role="switch"
        aria-checked={isDark}
      >
        {/* Switch Track */}
        <div className="relative w-full h-full">
          {/* Switch Thumb */}
          <div
            className={cn(
              "absolute top-0.5 bg-white rounded-full shadow-soft transition-all duration-300 ease-out",
              "flex items-center justify-center",
              size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5",
              isDark
                ? size === "sm"
                  ? "translate-x-4"
                  : size === "lg"
                  ? "translate-x-6"
                  : "translate-x-5"
                : "translate-x-0"
            )}
          >
            {/* Icons */}
            <Sun
              className={cn(
                "absolute transition-all duration-300",
                iconSizes[size],
                isDark
                  ? "opacity-0 scale-0 text-yellow-400"
                  : "opacity-100 scale-100 text-yellow-500"
              )}
            />
            <Moon
              className={cn(
                "absolute transition-all duration-300",
                iconSizes[size],
                isDark
                  ? "opacity-100 scale-100 text-blue-600"
                  : "opacity-0 scale-0 text-gray-600"
              )}
            />
          </div>
        </div>
      </button>
    );
  }

  // Button variant
  return (
    <button
      onClick={handleToggle}
      className={cn(
        // Base styles
        "relative rounded-xl p-2 transition-all duration-300 ease-out",
        "bg-gray-100 hover:bg-gray-200 border border-gray-200",
        "dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700",
        "focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:ring-offset-2",
        "dark:focus:ring-offset-gray-900",
        "shadow-lg hover:shadow-xl",
        "active:scale-95",

        // Size
        sizeClasses[size],

        className
      )}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun icon for light mode */}
        <Sun
          className={cn(
            "absolute transition-all duration-300",
            iconSizes[size],
            !isDark
              ? "opacity-100 scale-100 rotate-0 text-yellow-500"
              : "opacity-0 scale-75 rotate-90 text-yellow-400"
          )}
        />

        {/* Moon icon for dark mode */}
        <Moon
          className={cn(
            "absolute transition-all duration-300",
            iconSizes[size],
            isDark
              ? "opacity-100 scale-100 rotate-0 text-blue-400"
              : "opacity-0 scale-75 -rotate-90 text-blue-500"
          )}
        />
      </div>
    </button>
  );
};
