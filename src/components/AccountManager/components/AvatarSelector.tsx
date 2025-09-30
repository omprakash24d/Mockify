import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { cn } from "../../../lib/utils";
import { studyAvatars } from "../utils/constants";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (emoji: string) => void;
}

export function AvatarSelector({
  selectedAvatar,
  onAvatarSelect,
}: AvatarSelectorProps) {
  const { classes } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(studyAvatars.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleAvatars = studyAvatars.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div
      className={`p-6 rounded-2xl border-2 ${classes.border.light} ${classes.bg.accent} space-y-6`}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className={`text-lg font-bold ${classes.text.primary}`}>
            Avatar Gallery
          </h3>
        </div>
        <p className={`text-sm ${classes.text.secondary}`}>
          Choose your perfect study companion
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="relative">
        {/* Navigation buttons */}
        {totalPages > 1 && (
          <>
            <button
              type="button"
              onClick={prevPage}
              className={`
                absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 z-10
                w-8 h-8 rounded-full ${classes.bg.elevated} ${classes.border.default} border
                flex items-center justify-center ${classes.text.secondary}
                hover:${classes.text.primary} hover:scale-110 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                dark:focus:ring-offset-gray-800 shadow-lg
              `}
              aria-label="Previous avatars"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={nextPage}
              className={`
                absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 z-10
                w-8 h-8 rounded-full ${classes.bg.elevated} ${classes.border.default} border
                flex items-center justify-center ${classes.text.secondary}
                hover:${classes.text.primary} hover:scale-110 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                dark:focus:ring-offset-gray-800 shadow-lg
              `}
              aria-label="Next avatars"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Avatar Grid */}
        <div className="grid grid-cols-4 gap-4 px-2">
          {visibleAvatars.map((avatar, index) => {
            const isSelected = selectedAvatar === avatar.emoji;
            const isHovered = hoveredAvatar === avatar.emoji;

            return (
              <div key={avatar.name} className="relative group">
                <button
                  type="button"
                  onClick={() => onAvatarSelect(avatar.emoji)}
                  onMouseEnter={() => setHoveredAvatar(avatar.emoji)}
                  onMouseLeave={() => setHoveredAvatar(null)}
                  className={cn(
                    `relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl
                     transition-all duration-300 ease-out transform
                     focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2
                     dark:focus:ring-offset-gray-800`,
                    avatar.color,
                    isSelected
                      ? "ring-4 ring-blue-500 dark:ring-blue-400 scale-110 shadow-xl"
                      : isHovered
                      ? "scale-105 shadow-lg"
                      : "hover:scale-105 hover:shadow-lg shadow-md"
                  )}
                  title={avatar.name}
                  aria-label={`Select ${avatar.name} avatar`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />

                  {/* Emoji */}
                  <span className="relative z-10 filter drop-shadow-sm">
                    {avatar.emoji}
                  </span>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}

                  {/* Shine effect on hover */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl animate-pulse" />
                  )}
                </button>

                {/* Tooltip */}
                {isHovered && (
                  <div
                    className={`
                    absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20
                    px-2 py-1 text-xs font-medium ${classes.bg.elevated} ${classes.text.primary}
                    rounded-lg shadow-lg border ${classes.border.default}
                    animate-fade-in whitespace-nowrap
                  `}
                  >
                    {avatar.name}
                    <div
                      className={`absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 ${classes.bg.elevated} border-r ${classes.border.default} border-b rotate-45`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                currentPage === i
                  ? "bg-blue-500 w-6"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              )}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="text-center">
        <p
          className={`text-xs ${classes.text.secondary} flex items-center justify-center space-x-1`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Study-themed avatars designed for focus and motivation</span>
        </p>
      </div>
    </div>
  );
}
