import { useTheme } from "../../contexts/ThemeContext";
import { MessageDisplay } from "./components/MessageDisplay";
import { ModalProfileManagerWrapper } from "./components/ModalProfileManagerWrapper";
import { PasswordForm } from "./components/PasswordForm";
import { ProfileForm } from "./components/ProfileForm";
import { TabNavigation } from "./components/TabNavigation";
import {
  usePasswordActions,
  useProfileActions,
} from "./hooks/useAccountActions";
import { useAccountManager } from "./hooks/useAccountManager";
import type { PasswordFormData, VisibilityStates } from "./types";
import type { ProfileManagerProps } from "./types/profileManager";

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const { classes } = useTheme();
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
    onClose();
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
    <ModalProfileManagerWrapper isOpen={isOpen} onClose={handleClose}>
      {/* Enhanced Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Messages Display */}
      <MessageDisplay error={errors.general} success={success} />

      {/* Dynamic Content Area */}
      <div
        className={`transition-all duration-300 ease-in-out ${classes.bg.primary}`}
      >
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
    </ModalProfileManagerWrapper>
  );
};
