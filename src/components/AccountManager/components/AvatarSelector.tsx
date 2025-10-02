import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../lib/utils";
import { STUDY_AVATARS } from "../utils/constants";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (emoji: string) => void;
}

export function AvatarSelector({
  selectedAvatar,
  onAvatarSelect,
}: AvatarSelectorProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(STUDY_AVATARS.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleAvatars = STUDY_AVATARS.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () =>
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Choose Your Avatar
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Select your study companion
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="relative">
        {/* Navigation */}
        {totalPages > 1 && (
          <>
            <button
              type="button"
              onClick={prevPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous avatars"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={nextPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next avatars"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3">
          {visibleAvatars.map((avatar) => {
            const isSelected = selectedAvatar === avatar.emoji;

            return (
              <button
                key={avatar.name}
                type="button"
                onClick={() => onAvatarSelect(avatar.emoji)}
                className={cn(
                  "relative w-16 h-16 rounded-lg flex items-center justify-center text-2xl transition focus:outline-none focus:ring-2 focus:ring-blue-500",
                  avatar.color,
                  isSelected
                    ? "ring-2 ring-blue-500 dark:ring-blue-400 scale-105"
                    : "hover:scale-105"
                )}
                title={avatar.name}
                aria-label={`Select ${avatar.name} avatar`}
              >
                {avatar.emoji}

                {/* Selection indicator */}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={cn(
                "h-2 rounded-full transition",
                currentPage === i
                  ? "w-6 bg-blue-500"
                  : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              )}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
