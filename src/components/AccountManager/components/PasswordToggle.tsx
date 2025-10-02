import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function PasswordToggle({ isVisible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        absolute right-4 top-1/2 transform -translate-y-1/2 
        p-2 rounded-xl transition-all duration-200
        text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
        hover:bg-gray-100 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        active:scale-95 group
      `}
      aria-label={isVisible ? "Hide password" : "Show password"}
      title={isVisible ? "Hide password" : "Show password"}
    >
      <div className="relative">
        {isVisible ? (
          <EyeOff className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        ) : (
          <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        )}

        {/* Subtle animation indicator */}
        <div
          className={`
          absolute inset-0 rounded-full border-2 transition-all duration-300
          ${
            isVisible
              ? "border-blue-400/30 scale-125"
              : "border-transparent scale-100"
          }
        `}
        />
      </div>
    </button>
  );
}
