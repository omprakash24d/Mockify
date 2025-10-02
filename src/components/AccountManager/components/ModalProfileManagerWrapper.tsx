import { X } from "lucide-react";
import { ThemeToggle } from "../../ui/ThemeToggle";
import type { ModalProfileManagerProps } from "../types/profileManager";

export function ModalProfileManagerWrapper({
  isOpen,
  onClose,
  children,
}: ModalProfileManagerProps) {
  // Enhanced close handler with state cleanup
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with enhanced blur and gradient overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        onClick={(e) => {
          // Close modal when clicking on backdrop
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        {/* Enhanced backdrop with gradient and blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50 backdrop-blur-sm transition-opacity duration-300" />

        {/* Modal container with improved animations and styling */}
        <div className="relative w-full max-w-lg transform transition-all duration-300 ease-out animate-scale-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-hidden backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
            {/* Enhanced header with better spacing and theme toggle */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent dark:via-gray-800/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Profile Settings
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Manage your account preferences
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Theme toggle in header */}
                <ThemeToggle size="sm" variant="button" />

                {/* Close button with enhanced styling */}
                <button
                  onClick={handleClose}
                  className="p-2.5 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 active:scale-95"
                  aria-label="Close profile settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content area with enhanced scrollbar */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
