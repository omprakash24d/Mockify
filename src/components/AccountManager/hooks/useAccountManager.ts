import type { User } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { SecurityManager } from "../../../lib/security";
import type {
  FormErrors,
  LoadingStates,
  PasswordFormData,
  PasswordStrength,
  ProfileFormData,
  VisibilityStates,
} from "../types";
import { STUDY_AVATARS } from "../utils/constants";
import { validateDisplayName } from "../utils/helpers";

export function useAccountManager(user: User | null) {
  // Form data states
  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: "",
    selectedAvatar: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [errors, setErrors] = useState<FormErrors>({
    displayName: "",
    password: "",
    general: "",
  });

  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [loading, setLoading] = useState<LoadingStates>({
    profile: false,
    password: false,
  });

  const [visibility, setVisibility] = useState<VisibilityStates>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    errors: [],
    score: 0,
  });

  const securityManager = useMemo(() => SecurityManager.getInstance(), []);
  const debouncedNewPassword = useDebounce(passwordData.newPassword, 300);
  const debouncedDisplayName = useDebounce(profileData.displayName, 300);

  // Initialize component state when user loads
  useEffect(() => {
    if (user) {
      // Initialize selected avatar from user's current photo
      let selectedAvatar = "";
      if (user.photoURL && !user.photoURL.includes("googleusercontent.com")) {
        // Check if it's a data URL containing an emoji (our new format)
        if (user.photoURL.startsWith("data:text/plain")) {
          try {
            const emojiString = decodeURIComponent(user.photoURL.split(",")[1]);
            const currentAvatar = STUDY_AVATARS.find(
              (avatar) => avatar.emoji === emojiString
            );
            selectedAvatar = currentAvatar ? currentAvatar.emoji : "";
          } catch (error) {
            console.error("Error parsing avatar data URL:", error);
          }
        } else {
          // Legacy format - check if it contains an emoji directly
          const currentAvatar = STUDY_AVATARS.find((avatar) =>
            user.photoURL?.includes(avatar.emoji)
          );
          selectedAvatar = currentAvatar ? currentAvatar.emoji : "";
        }
      }

      // Reset form states
      setProfileData({
        displayName: user.displayName || "",
        selectedAvatar,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setErrors({
        displayName: "",
        password: "",
        general: "",
      });

      setSuccess("");
      setPasswordStrength({ isValid: false, errors: [], score: 0 });
    }
  }, [user]); // Only depend on user to prevent unnecessary re-renders

  // Validate display name
  useEffect(() => {
    if (
      debouncedDisplayName &&
      user &&
      debouncedDisplayName !== user.displayName
    ) {
      const error = validateDisplayName(debouncedDisplayName);
      setErrors((prev) => ({ ...prev, displayName: error }));
    } else {
      setErrors((prev) => ({ ...prev, displayName: "" }));
    }
  }, [debouncedDisplayName, user?.displayName]); // Only depend on the specific property

  // Update password strength when password changes
  useEffect(() => {
    if (debouncedNewPassword) {
      const strength =
        securityManager.validatePasswordStrength(debouncedNewPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ isValid: false, errors: [], score: 0 });
    }
  }, [debouncedNewPassword, securityManager]); // securityManager is stable via useMemo

  const updateProfileData = useCallback((updates: Partial<ProfileFormData>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updatePasswordData = useCallback(
    (updates: Partial<PasswordFormData>) => {
      setPasswordData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const updateErrors = useCallback((updates: Partial<FormErrors>) => {
    setErrors((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateLoading = useCallback((updates: Partial<LoadingStates>) => {
    setLoading((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateVisibility = useCallback((updates: Partial<VisibilityStates>) => {
    setVisibility((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || "",
        selectedAvatar: "",
      });
    }

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setErrors({
      displayName: "",
      password: "",
      general: "",
    });

    setSuccess("");
    setPasswordStrength({ isValid: false, errors: [], score: 0 });
    setActiveTab("profile");

    setVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });

    setLoading({
      profile: false,
      password: false,
    });
  }, [user]);

  const setSuccessMessage = useCallback((message: string, duration = 3000) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), duration);
  }, []);

  return {
    // Data
    profileData,
    passwordData,
    errors,
    success,
    activeTab,
    loading,
    visibility,
    passwordStrength,

    // Actions
    updateProfileData,
    updatePasswordData,
    updateErrors,
    updateLoading,
    updateVisibility,
    setActiveTab,
    resetForm,
    setSuccessMessage,
  };
}
