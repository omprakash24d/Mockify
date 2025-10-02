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
      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}
