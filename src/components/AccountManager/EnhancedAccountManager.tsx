import { useAuth } from "../../hooks/useAuth";
import { MessageDisplay } from "./components/MessageDisplay";
import { ModalWrapper } from "./components/ModalWrapper";
import { PasswordForm } from "./components/PasswordForm";
import { ProfileForm } from "./components/ProfileForm";
import { TabNavigation } from "./components/TabNavigation";
import {
  usePasswordActions,
  useProfileActions,
} from "./hooks/useAccountActions";
import { useAccountManager } from "./hooks/useAccountManager";
import type { PasswordFormData, VisibilityStates } from "./types";

export function EnhancedAccountManager() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to manage your account.
        </p>
      </div>
    );
  }

  const {
    profileData,
    passwordData,
    errors,
    success,
    activeTab,
    loading,
    visibility,
    passwordStrength,
    updateProfileData,
    updatePasswordData,
    updateErrors,
    updateLoading,
    updateVisibility,
    setActiveTab,
    resetForm,
    setSuccessMessage,
  } = useAccountManager(user);

  const { handleUpdateProfile } = useProfileActions();
  const { handleUpdatePassword } = usePasswordActions();

  // Enhanced close handler with state cleanup
  const handleClose = () => {
    resetForm();
    window.location.reload(); // Refresh to reflect changes
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't proceed if there are validation errors
    if (errors.displayName) {
      updateErrors({ general: errors.displayName });
      return;
    }

    await handleUpdateProfile(
      user,
      profileData,
      setSuccessMessage,
      (error) => updateErrors({ general: error }),
      (loading) => updateLoading({ profile: loading })
    );
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resetPasswordForm = () => {
      updatePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    };

    await handleUpdatePassword(
      user,
      passwordData,
      passwordStrength,
      setSuccessMessage,
      (error) => updateErrors({ general: error }),
      (loading) => updateLoading({ password: loading }),
      resetPasswordForm
    );
  };

  const handlePasswordChange = (
    field: keyof PasswordFormData,
    value: string
  ) => {
    updatePasswordData({ [field]: value });
  };

  const handleVisibilityToggle = (field: keyof VisibilityStates) => {
    updateVisibility({ [field]: !visibility[field] });
  };

  return (
    <ModalWrapper onClose={handleClose}>
      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="p-6">
        {/* Messages */}
        <MessageDisplay error={errors.general} success={success} />

        {activeTab === "profile" ? (
          <ProfileForm
            user={user}
            profileData={profileData}
            displayNameError={errors.displayName}
            loading={loading.profile}
            onDisplayNameChange={(value) =>
              updateProfileData({ displayName: value })
            }
            onAvatarSelect={(emoji) =>
              updateProfileData({ selectedAvatar: emoji })
            }
            onSubmit={handleProfileSubmit}
          />
        ) : (
          <PasswordForm
            passwordData={passwordData}
            passwordStrength={passwordStrength}
            visibility={visibility}
            loading={loading.password}
            onPasswordChange={handlePasswordChange}
            onVisibilityToggle={handleVisibilityToggle}
            onSubmit={handlePasswordSubmit}
          />
        )}
      </div>
    </ModalWrapper>
  );
}
