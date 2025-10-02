import type { User as FirebaseUser } from "firebase/auth";
import { CheckCircle, Mail, Save, User } from "lucide-react";
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
  return (
    <div
      role="tabpanel"
      id="profile-panel"
      aria-labelledby="profile-tab"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="relative inline-block">
          <UserAvatar user={user} selectedAvatar={profileData.selectedAvatar} />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </span>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Profile Information
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Customize your personal details
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Display Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Display Name <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <User
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                displayNameError ? "text-red-500" : "text-gray-400"
              )}
            />

            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              maxLength={50}
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition focus:outline-none focus:ring-2",
                displayNameError
                  ? "border-red-300 dark:border-red-600 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              )}
              placeholder="Enter your display name"
              required
            />
          </div>

          {displayNameError ? (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {displayNameError}
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use 2-50 characters with letters, numbers, and common symbols
            </p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Email Address
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />

            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Choose Profile Avatar
          </label>

          <AvatarSelector
            selectedAvatar={profileData.selectedAvatar}
            onAvatarSelect={onAvatarSelect}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !!displayNameError}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500",
            loading || displayNameError
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          )}
        >
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
        </button>
      </form>
    </div>
  );
}
