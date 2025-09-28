/**
 * Enhanced Account Management Component
 * Implements comprehensive UX improvements and accessibility features
 * Based on user feedback for simplified, user-friendly interface
 */

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import {
  AlertCircle,
  Check,
  Download,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Smartphone,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { securityManager } from "../lib/enhanced-security";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

// Avatar options with study theme
const AVATAR_OPTIONS = [
  {
    emoji: "🎓",
    bg: "bg-blue-100 dark:bg-blue-900",
    color: "text-blue-600 dark:text-blue-300",
  },
  {
    emoji: "📚",
    bg: "bg-green-100 dark:bg-green-900",
    color: "text-green-600 dark:text-green-300",
  },
  {
    emoji: "🧬",
    bg: "bg-purple-100 dark:bg-purple-900",
    color: "text-purple-600 dark:text-purple-300",
  },
  {
    emoji: "⚛️",
    bg: "bg-red-100 dark:bg-red-900",
    color: "text-red-600 dark:text-red-300",
  },
  {
    emoji: "🔬",
    bg: "bg-yellow-100 dark:bg-yellow-900",
    color: "text-yellow-600 dark:text-yellow-300",
  },
  {
    emoji: "🧮",
    bg: "bg-orange-100 dark:bg-orange-900",
    color: "text-orange-600 dark:text-orange-300",
  },
  {
    emoji: "📐",
    bg: "bg-teal-100 dark:bg-teal-900",
    color: "text-teal-600 dark:text-teal-300",
  },
  {
    emoji: "🌟",
    bg: "bg-indigo-100 dark:bg-indigo-900",
    color: "text-indigo-600 dark:text-indigo-300",
  },
];

interface FormData {
  displayName: string;
  email: string;
  selectedAvatar: number;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationState {
  displayName: string[];
  password: string[];
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  strength: "very-weak" | "weak" | "fair" | "good" | "strong";
}

export const EnhancedAccountManager: React.FC = () => {
  const { user } = useAuth();
  const { classes } = useTheme();

  // Check if user signed in with Google OAuth
  const isGoogleUser =
    user?.providerData.some(
      (provider) => provider.providerId === "google.com"
    ) ?? false;

  // State management
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: user?.displayName || "",
    email: user?.email || "",
    selectedAvatar: 0,
  });
  const [originalFormData, setOriginalFormData] = useState<FormData>(formData);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [validation, setValidation] = useState<ValidationState>({
    displayName: [],
    password: [],
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    strength: "very-weak",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Refs for accessibility
  const firstErrorRef = useRef<HTMLInputElement>(null);

  // Initialize form data
  useEffect(() => {
    if (user) {
      const initial = {
        displayName: user.displayName || "",
        email: user.email || "",
        selectedAvatar: 0,
      };
      setFormData(initial);
      setOriginalFormData(initial);
    }
  }, [user]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(originalFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalFormData]);

  // Form validation
  useEffect(() => {
    const newValidation: ValidationState = {
      displayName: [],
      password: [],
    };

    // Display name validation
    if (!formData.displayName.trim()) {
      newValidation.displayName.push("Display name is required");
    } else if (formData.displayName.trim().length < 2) {
      newValidation.displayName.push(
        "Display name must be at least 2 characters"
      );
    } else if (formData.displayName.trim().length > 50) {
      newValidation.displayName.push(
        "Display name must be less than 50 characters"
      );
    }

    // Password validation (only if changing password)
    if (
      activeTab === "security" &&
      (passwordData.newPassword || passwordData.confirmPassword)
    ) {
      // For Google OAuth users, current password is not required for first-time password setup
      if (!isGoogleUser && !passwordData.currentPassword) {
        newValidation.password.push("Current password is required");
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newValidation.password.push("New passwords do not match");
      }
    }

    setValidation(newValidation);

    // Form validity
    const isValid =
      activeTab === "profile"
        ? newValidation.displayName.length === 0 && hasUnsavedChanges
        : newValidation.password.length === 0 &&
          (isGoogleUser
            ? passwordData.newPassword
            : passwordData.currentPassword && passwordData.newPassword);

    setIsFormValid(Boolean(isValid));
  }, [formData, passwordData, activeTab, hasUnsavedChanges]);

  // Password strength analysis
  useEffect(() => {
    if (passwordData.newPassword) {
      const strength = securityManager.validatePasswordStrength(
        passwordData.newPassword
      );
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [], strength: "very-weak" });
    }
  }, [passwordData.newPassword]);

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftKey = `mockify_profile_draft_${user?.uid}`;
    if (hasUnsavedChanges) {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [formData, hasUnsavedChanges, user?.uid]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = `mockify_profile_draft_${user?.uid}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, [user?.uid]);

  // Message timeout
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Focus first invalid field on submit failure
  const focusFirstError = () => {
    setTimeout(() => {
      if (firstErrorRef.current) {
        firstErrorRef.current.focus();
        firstErrorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  // Handle profile form input changes
  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: securityManager.sanitizeInput(value.toString()),
    }));
    clearMessages();
  };

  // Handle password form input changes
  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value, // Don't sanitize passwords
    }));
    clearMessages();
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Clear messages
  const clearMessages = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Reset form to original state
  const resetForm = () => {
    setFormData(originalFormData);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    clearMessages();
    const draftKey = `mockify_profile_draft_${user?.uid}`;
    localStorage.removeItem(draftKey);
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user || !isFormValid) {
      focusFirstError();
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      await updateProfile(user, {
        displayName: formData.displayName.trim(),
      });

      // Store additional profile data in localStorage for now
      // In production, this should be stored in Firestore user document
      localStorage.setItem(
        `mockify_user_profile_${user.uid}`,
        JSON.stringify({
          displayName: formData.displayName.trim(),
          selectedAvatar: formData.selectedAvatar,
          updatedAt: new Date().toISOString(),
        })
      );

      setOriginalFormData(formData);
      setSuccessMessage("Profile updated successfully! 🎉");

      // Clear draft
      const draftKey = `mockify_profile_draft_${user?.uid}`;
      localStorage.removeItem(draftKey);
    } catch (error: any) {
      console.error("Profile update error:", error);
      setErrorMessage(
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!user || !user.email || !isFormValid) {
      focusFirstError();
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      // For Google OAuth users, they don't need to provide current password for first setup
      if (!isGoogleUser) {
        // Reauthenticate user for email/password accounts
        const credential = EmailAuthProvider.credential(
          user.email,
          passwordData.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
      }

      // Update password
      await updatePassword(user, passwordData.newPassword);

      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      const message = isGoogleUser
        ? "Password set successfully! You can now sign in with email and password. 🔒"
        : "Password updated successfully! 🔒";
      setSuccessMessage(message);
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.code === "auth/wrong-password") {
        setErrorMessage("Current password is incorrect.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage(
          "New password is too weak. Please choose a stronger password."
        );
      } else if (error.code === "auth/requires-recent-login") {
        setErrorMessage(
          "For security reasons, please sign out and sign back in before changing your password."
        );
      } else {
        setErrorMessage(
          error.message || "Failed to update password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Export profile data
  const exportProfileData = () => {
    const profileData = {
      displayName: formData.displayName,
      email: formData.email,
      selectedAvatar: formData.selectedAvatar,
      accountCreated: user?.metadata.creationTime,
      lastSignIn: user?.metadata.lastSignInTime,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(profileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `mockify-profile-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    switch (passwordStrength.strength) {
      case "very-weak":
        return "bg-red-500";
      case "weak":
        return "bg-orange-500";
      case "fair":
        return "bg-yellow-500";
      case "good":
        return "bg-blue-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      resetForm();
    } else if (event.key === "Enter" && event.ctrlKey) {
      if (activeTab === "profile") {
        handleProfileUpdate();
      } else {
        handlePasswordUpdate();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6" onKeyDown={handleKeyDown}>
      <Card
        className={`${classes.bg.primary} ${classes.border.default} overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`${classes.bg.secondary} px-6 py-4 border-b ${classes.border.default}`}
        >
          <h2
            className={`text-2xl font-bold ${classes.text.primary} flex items-center gap-2`}
          >
            <Settings className="h-6 w-6" />
            Account Settings
          </h2>
          <p className={`${classes.text.secondary} mt-1`}>
            Manage your profile and security settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex-1 px-6 py-4 text-sm font-medium transition-colors relative",
              "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
              activeTab === "profile"
                ? `${classes.text.accent} border-b-2 border-blue-500`
                : `${classes.text.secondary} hover:${classes.text.primary}`
            )}
            aria-selected={activeTab === "profile"}
            role="tab"
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile
            {hasUnsavedChanges && activeTab === "profile" && (
              <span
                className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"
                aria-label="Unsaved changes"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex-1 px-6 py-4 text-sm font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
              activeTab === "security"
                ? `${classes.text.accent} border-b-2 border-blue-500`
                : `${classes.text.secondary} hover:${classes.text.primary}`
            )}
            aria-selected={activeTab === "security"}
            role="tab"
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Security
          </button>
        </div>

        {/* Messages */}
        {(successMessage || errorMessage) && (
          <div
            className={`p-4 ${
              successMessage ? classes.status.success : classes.status.error
            }`}
          >
            <div className="flex items-center gap-2">
              {successMessage ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {successMessage || errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" ? (
            /* Profile Tab */
            <div className="space-y-6" role="tabpanel">
              {/* Avatar Selection */}
              <div>
                <label
                  className={`block text-sm font-medium ${classes.text.primary} mb-3`}
                >
                  Profile Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {AVATAR_OPTIONS.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleFormChange("selectedAvatar", index)}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        "hover:scale-110 active:scale-95",
                        avatar.bg,
                        avatar.color,
                        formData.selectedAvatar === index
                          ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                          : ""
                      )}
                      aria-label={`Select ${avatar.emoji} avatar`}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label
                  htmlFor="displayName"
                  className={`block text-sm font-medium ${classes.text.primary} mb-2`}
                >
                  Display Name *
                </label>
                <input
                  ref={
                    validation.displayName.length > 0
                      ? firstErrorRef
                      : undefined
                  }
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleFormChange("displayName", e.target.value)
                  }
                  className={cn(
                    "w-full px-3 py-2 border rounded-md transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    classes.input.default,
                    validation.displayName.length > 0 ? classes.input.error : ""
                  )}
                  placeholder="Enter your display name"
                  maxLength={50}
                  aria-describedby={
                    validation.displayName.length > 0
                      ? "displayName-error"
                      : undefined
                  }
                  aria-invalid={validation.displayName.length > 0}
                />
                {validation.displayName.length > 0 && (
                  <div
                    id="displayName-error"
                    className={`mt-1 text-sm ${classes.text.error}`}
                  >
                    {validation.displayName.map((error, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                <div className={`mt-1 text-xs ${classes.text.tertiary}`}>
                  {formData.displayName.length}/50 characters
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label
                  className={`block text-sm font-medium ${classes.text.primary} mb-2`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md transition-colors",
                    classes.input.default,
                    "opacity-60 cursor-not-allowed"
                  )}
                  readOnly
                  aria-describedby="email-help"
                />
                <p
                  id="email-help"
                  className={`mt-1 text-xs ${classes.text.tertiary}`}
                >
                  Email address cannot be changed from this page
                </p>
              </div>

              {/* Profile Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={handleProfileUpdate}
                  disabled={loading || !isFormValid}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  onClick={resetForm}
                  variant="secondary"
                  disabled={loading || !hasUnsavedChanges}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>

                <Button
                  onClick={exportProfileData}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
          ) : (
            /* Security Tab */
            <div className="space-y-6" role="tabpanel">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className={`block text-sm font-medium ${classes.text.primary} mb-2`}
                >
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    ref={
                      validation.password.some((e) => e.includes("Current"))
                        ? firstErrorRef
                        : undefined
                    }
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    className={cn(
                      "w-full px-3 py-2 pr-10 border rounded-md transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500",
                      classes.input.default,
                      validation.password.some((e) => e.includes("Current"))
                        ? classes.input.error
                        : ""
                    )}
                    placeholder="Enter your current password"
                    aria-describedby={
                      validation.password.some((e) => e.includes("Current"))
                        ? "currentPassword-error"
                        : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${classes.text.secondary} hover:${classes.text.primary}`}
                    aria-label={
                      showPasswords.current ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className={`block text-sm font-medium ${classes.text.primary} mb-2`}
                >
                  New Password *
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className={cn(
                      "w-full px-3 py-2 pr-10 border rounded-md transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500",
                      classes.input.default
                    )}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${classes.text.secondary} hover:${classes.text.primary}`}
                    aria-label={
                      showPasswords.new ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium ${classes.text.secondary}`}
                      >
                        Password Strength:{" "}
                        {passwordStrength.strength.replace("-", " ")}
                      </span>
                      <span className={`text-xs ${classes.text.tertiary}`}>
                        {passwordStrength.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className={`mt-2 text-xs ${classes.text.secondary}`}>
                        <p className="font-medium mb-1">Suggestions:</p>
                        <ul className="space-y-1 pl-2">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-orange-500 mt-0.5">•</span>
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm font-medium ${classes.text.primary} mb-2`}
                >
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    ref={
                      validation.password.some((e) => e.includes("match"))
                        ? firstErrorRef
                        : undefined
                    }
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    className={cn(
                      "w-full px-3 py-2 pr-10 border rounded-md transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500",
                      classes.input.default,
                      validation.password.some((e) => e.includes("match"))
                        ? classes.input.error
                        : ""
                    )}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${classes.text.secondary} hover:${classes.text.primary}`}
                    aria-label={
                      showPasswords.confirm ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password validation errors */}
              {validation.password.length > 0 && (
                <div className={`p-3 rounded-md ${classes.status.error}`}>
                  {validation.password.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Security Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={handlePasswordUpdate}
                  disabled={loading || !isFormValid}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  {loading ? "Updating..." : "Update Password"}
                </Button>

                <Button
                  onClick={() =>
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }
                  variant="secondary"
                  disabled={
                    loading ||
                    (!passwordData.currentPassword &&
                      !passwordData.newPassword &&
                      !passwordData.confirmPassword)
                  }
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>

              {/* 2FA Section (Placeholder for future implementation) */}
              <div className={`border-t ${classes.border.default} pt-6`}>
                <h3
                  className={`text-lg font-medium ${classes.text.primary} mb-3 flex items-center gap-2`}
                >
                  <Smartphone className="h-5 w-5" />
                  Two-Factor Authentication
                </h3>
                <p className={`${classes.text.secondary} mb-4`}>
                  Add an extra layer of security to your account with 2FA.
                </p>
                <Button variant="outline" disabled>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Enable 2FA (Coming Soon)
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EnhancedAccountManager;
