import type { User as FirebaseUser } from "firebase/auth";
import { CheckCircle, Mail, Save, Sparkles, User } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { cn } from "../../../lib/utils";
import type { ProfileFormData } from "../types";
import { AvatarSelector } from "./AvatarSelector";
import { UserAvatar } from "./UserAvatar";

interface ProfileFormProps {
  user: FirebaseUser;
  profileData: ProfileFormData;
  displayNameError: string;
  loading: boolean;
  onDisplayNameChange: (value: string) => void;
  onAvatarSelect: (emoji: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileForm({
  user,
  profileData,
  displayNameError,
  loading,
  onDisplayNameChange,
  onAvatarSelect,
  onSubmit,
}: ProfileFormProps) {
  const { classes } = useTheme();

  return (
    <div
      role="tabpanel"
      id="profile-panel"
      aria-labelledby="profile-tab"
      className="p-6 sm:p-8 space-y-8"
    >
      {/* Header section with enhanced styling */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="relative">
            <UserAvatar
              user={user}
              selectedAvatar={profileData.selectedAvatar}
            />
            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded-full animate-pulse" />
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-200 dark:bg-purple-800 rounded-full animate-pulse delay-300" />
        </div>

        <div className="space-y-1">
          <h3 className={`text-lg font-semibold ${classes.text.primary}`}>
            Profile Information
          </h3>
          <p className={`text-sm ${classes.text.secondary}`}>
            Customize your personal details and preferences
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Display Name Section */}
        <div className="space-y-3">
          <label
            className={`block text-sm font-semibold ${classes.text.primary}`}
          >
            Display Name
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="relative group">
            <div
              className={`
              absolute left-3 top-1/2 transform -translate-y-1/2 
              transition-colors duration-200
              ${
                displayNameError
                  ? "text-red-500"
                  : "text-gray-400 group-focus-within:text-blue-500"
              }
            `}
            >
              <User className="h-5 w-5" />
            </div>

            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              className={cn(
                `w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-200
                 text-sm font-medium placeholder-gray-400
                 focus:outline-none focus:ring-4 focus:ring-blue-500/20`,
                classes.bg.elevated,
                classes.text.primary,
                displayNameError
                  ? `border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400
                     bg-red-50/50 dark:bg-red-900/10`
                  : `${classes.border.default} focus:border-blue-500 dark:focus:border-blue-400
                     hover:border-gray-300 dark:hover:border-gray-600`
              )}
              placeholder="Enter your display name"
              required
              aria-describedby="display-name-help"
            />

            {/* Character count indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span
                className={`text-xs ${
                  profileData.displayName.length > 45
                    ? "text-yellow-500"
                    : profileData.displayName.length > 50
                    ? "text-red-500"
                    : classes.text.secondary
                }`}
              >
                {profileData.displayName.length}/50
              </span>
            </div>
          </div>

          {displayNameError ? (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <div className="w-1 h-1 bg-red-500 rounded-full" />
              <p className="text-xs font-medium">{displayNameError}</p>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Sparkles className="w-3 h-3" />
              <p id="display-name-help" className="text-xs">
                Use 2-50 characters with letters, numbers, and common symbols
              </p>
            </div>
          )}
        </div>

        {/* Email Section (Enhanced read-only styling) */}
        <div className="space-y-3">
          <label
            className={`block text-sm font-semibold ${classes.text.primary}`}
          >
            Email Address
          </label>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail className="h-5 w-5" />
            </div>

            <input
              type="email"
              value={user.email || ""}
              disabled
              className={cn(
                `w-full pl-12 pr-4 py-4 rounded-2xl border-2 text-sm font-medium
                 ${classes.border.default} ${classes.bg.accent} 
                 ${classes.text.secondary} cursor-not-allowed`
              )}
            />

            {/* Verified badge */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Selection with enhanced presentation */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className={`w-4 h-4 ${classes.text.accent}`} />
            <label className={`text-sm font-semibold ${classes.text.primary}`}>
              Choose Profile Avatar
            </label>
          </div>

          <AvatarSelector
            selectedAvatar={profileData.selectedAvatar}
            onAvatarSelect={onAvatarSelect}
          />
        </div>

        {/* Enhanced Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !!displayNameError}
            className={cn(
              `w-full flex items-center justify-center py-4 px-6 rounded-2xl
               text-sm font-bold transition-all duration-200 transform
               focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2
               dark:focus:ring-offset-gray-800 relative overflow-hidden group`,
              loading || displayNameError
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : `${classes.button.primary} hover:scale-[1.02] active:scale-[0.98] 
                   shadow-lg hover:shadow-xl`
            )}
          >
            {/* Button background gradient */}
            {!(loading || displayNameError) && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            {/* Button content */}
            <div className="relative flex items-center space-x-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </div>

            {/* Success ripple effect */}
            {!(loading || displayNameError) && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
