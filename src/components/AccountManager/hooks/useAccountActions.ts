import type { User } from "firebase/auth";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import type { PasswordFormData, ProfileFormData } from "../types";
import { getErrorMessage } from "../utils/helpers";

export function useProfileActions() {
  const handleUpdateProfile = async (
    user: User | null,
    profileData: ProfileFormData,
    onSuccess: (message: string) => void,
    onError: (error: string) => void,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    onError("");

    try {
      // Validate user object
      if (!user) {
        onError("User not authenticated");
        return;
      }

      // Validate user object has required properties
      if (!user.uid) {
        onError("Invalid user session");
        return;
      }

      const updates: Partial<{ displayName: string; photoURL: string }> = {};

      if (
        profileData.displayName &&
        profileData.displayName !== user.displayName
      ) {
        updates.displayName = profileData.displayName.trim();
      }

      // Handle avatar selection - create a data URL for emoji or use existing photo URL
      if (profileData.selectedAvatar) {
        // Create a simple data URL that includes the emoji for identification
        // This is a workaround since Firebase photoURL expects a URL format
        updates.photoURL = `data:text/plain;charset=utf-8,${encodeURIComponent(
          profileData.selectedAvatar
        )}`;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(user, updates);
        onSuccess("Profile updated successfully!");
      } else {
        onSuccess("No changes to save.");
      }
    } catch (error: unknown) {
      onError(getErrorMessage(error));
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleUpdateProfile };
}

export function usePasswordActions() {
  const handleUpdatePassword = async (
    user: User | null,
    passwordData: PasswordFormData,
    passwordStrength: { isValid: boolean; errors: string[] },
    onSuccess: (message: string) => void,
    onError: (error: string) => void,
    setLoading: (loading: boolean) => void,
    resetPasswordForm: () => void
  ) => {
    // Validate current password is provided
    if (!passwordData.currentPassword.trim()) {
      onError("Current password is required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      onError("New passwords don't match");
      return;
    }

    // Use security manager validation instead of simple length check
    if (!passwordStrength.isValid) {
      onError(
        `Password requirements not met: ${passwordStrength.errors.join(", ")}`
      );
      return;
    }

    setLoading(true);
    onError("");

    try {
      // Validate user object
      if (!user) {
        onError("User not authenticated");
        return;
      }

      if (!user.email) {
        onError("User email not available");
        return;
      }

      if (!user.uid) {
        onError("Invalid user session");
        return;
      }

      // Reauthenticate user before password change
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password after successful reauthentication
      await updatePassword(user, passwordData.newPassword);

      onSuccess("Password updated successfully!");
      resetPasswordForm();
    } catch (error: unknown) {
      onError(getErrorMessage(error));
      console.error("Password update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleUpdatePassword };
}
