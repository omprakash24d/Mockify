import { useEffect, useState } from "react";
import { SecurityManager } from "../../../lib/security";
import UserProfileService from "../../../lib/user-profile";
import type { CoachingDetailsFormData } from "../../../lib/validations";
import type {
  AuthFormData,
  AuthHandlers,
  AuthState,
  FormFieldHandlers,
  PasswordStrength,
} from "../types";
import { clearSignupFields, validateForm } from "../utils";
import { AuthService } from "../utils/authService";

export const useAuth = () => {
  // Form data state
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    coachingName: "",
    phoneNumber: "",
    coachingLogo: "",
  });

  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    isLogin: true,
    loading: false,
    googleLoading: false,
    resetLoading: false,
    error: "",
    resetEmailSent: false,
    validationErrors: {},
    showCoachingModal: false,
    pendingUser: null,
    isFormValid: false,
    showPassword: false,
    showConfirmPassword: false,
  });

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    isValid: false,
    feedback: [],
    score: 0,
    strength: "very-weak",
  });

  // Initialize services
  const authService = new AuthService();
  const securityManager = SecurityManager.getInstance();

  // Check account lockout on component mount and email change
  useEffect(() => {
    if (formData.email) {
      const isLocked = securityManager.isAccountLocked(formData.email);
      if (isLocked) {
        const remainingTime = securityManager.getRemainingLockoutTime(
          formData.email
        );
        console.log(`Account locked for ${remainingTime}ms`);
      }
    }
  }, [formData.email, securityManager]);

  // Update password strength on password change
  useEffect(() => {
    if (formData.password && !authState.isLogin) {
      const strength = authService.checkPasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password, authState.isLogin, authService]);

  // Validate form completeness and correctness
  useEffect(() => {
    const isValid = validateForm(authState.isLogin, formData, passwordStrength);
    setAuthState((prev) => ({ ...prev, isFormValid: isValid }));

    // Clear validation errors for valid form
    if (isValid) {
      setAuthState((prev) => ({ ...prev, validationErrors: {} }));
    }
  }, [
    authState.isLogin,
    formData.email,
    formData.password,
    formData.confirmPassword,
    formData.name,
    formData.coachingName,
    formData.phoneNumber,
    passwordStrength.isValid,
  ]);

  // Form field handlers
  const formFieldHandlers: FormFieldHandlers = {
    setEmail: (value: string) =>
      setFormData((prev) => ({ ...prev, email: value })),
    setPassword: (value: string) =>
      setFormData((prev) => ({ ...prev, password: value })),
    setConfirmPassword: (value: string) =>
      setFormData((prev) => ({ ...prev, confirmPassword: value })),
    setName: (value: string) =>
      setFormData((prev) => ({ ...prev, name: value })),
    setCoachingName: (value: string) =>
      setFormData((prev) => ({ ...prev, coachingName: value })),
    setPhoneNumber: (value: string) =>
      setFormData((prev) => ({ ...prev, phoneNumber: value })),
    setCoachingLogo: (value: string) =>
      setFormData((prev) => ({ ...prev, coachingLogo: value })),
  };

  // Auth handlers
  const authHandlers: AuthHandlers = {
    handleEmailAuth: async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthState((prev) => ({
        ...prev,
        loading: true,
        error: "",
        validationErrors: {},
      }));

      try {
        if (authState.isLogin) {
          await authService.signInWithEmail(formData.email, formData.password);
        } else {
          await authService.signUpWithEmail(formData, passwordStrength);
        }
      } catch (error: any) {
        setAuthState((prev) => ({ ...prev, error: error.message }));
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },

    handleGoogleAuth: async () => {
      setAuthState((prev) => ({ ...prev, googleLoading: true, error: "" }));

      try {
        const { user, needsDetails } = await authService.signInWithGoogle();

        // Auto-fill available Google profile information
        if (user.displayName && !formData.name) {
          formFieldHandlers.setName(user.displayName);
        }
        if (user.email && !formData.email) {
          formFieldHandlers.setEmail(user.email);
        }

        if (needsDetails) {
          // If we're in signup mode and have Google data, switch to signup to show the form
          if (authState.isLogin) {
            setAuthState((prev) => ({ ...prev, isLogin: false }));
          }

          // Set pending user and show coaching details modal for immediate completion
          setAuthState((prev) => ({
            ...prev,
            pendingUser: user,
            showCoachingModal: true,
          }));
          return;
        }

        console.log("Google login successful:", user.email);
      } catch (error: any) {
        if (error.message) {
          setAuthState((prev) => ({ ...prev, error: error.message }));
        }
      } finally {
        setAuthState((prev) => ({ ...prev, googleLoading: false }));
      }
    },

    handlePasswordReset: async () => {
      setAuthState((prev) => ({ ...prev, error: "", resetLoading: true }));

      try {
        await authService.sendPasswordReset(formData.email);
        setAuthState((prev) => ({ ...prev, resetEmailSent: true, error: "" }));
        // Clear password fields after successful reset email
        formFieldHandlers.setPassword("");
        formFieldHandlers.setConfirmPassword("");
      } catch (error: any) {
        setAuthState((prev) => ({ ...prev, error: error.message }));
      } finally {
        setAuthState((prev) => ({ ...prev, resetLoading: false }));
      }
    },

    handleCoachingDetailsComplete: async (details: CoachingDetailsFormData) => {
      if (!authState.pendingUser) return;

      try {
        // Validate that all essential information is provided
        if (!details.coachingName || !details.phoneNumber) {
          setAuthState((prev) => ({
            ...prev,
            error: "All coaching details are required to proceed.",
          }));
          return;
        }

        // Update or create user profile with coaching details
        const existingProfile = await UserProfileService.getUserProfile(
          authState.pendingUser.uid
        );

        if (existingProfile) {
          await UserProfileService.updateUserProfile(
            authState.pendingUser.uid,
            details
          );
        } else {
          await UserProfileService.createUserProfile(
            authState.pendingUser,
            details
          );
        }

        setAuthState((prev) => ({
          ...prev,
          showCoachingModal: false,
          pendingUser: null,
        }));

        // Clear form data after successful completion
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
          coachingName: "",
          phoneNumber: "",
          coachingLogo: "",
        });

        console.log("Coaching details saved successfully");
      } catch (error) {
        console.error("Error saving coaching details:", error);
        setAuthState((prev) => ({
          ...prev,
          error: "Failed to save coaching details. Please try again.",
        }));
      }
    },

    toggleAuthMode: () => {
      setAuthState((prev) => ({
        ...prev,
        isLogin: !prev.isLogin,
        error: "",
        resetEmailSent: false,
        validationErrors: {},
        isFormValid: false,
      }));

      // Clear signup fields when switching to login
      if (!authState.isLogin) {
        const clearedFields = clearSignupFields();
        setFormData((prev) => ({ ...prev, ...clearedFields }));
      }
      formFieldHandlers.setPassword("");
    },

    togglePasswordVisibility: () => {
      setAuthState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
    },

    toggleConfirmPasswordVisibility: () => {
      setAuthState((prev) => ({
        ...prev,
        showConfirmPassword: !prev.showConfirmPassword,
      }));
    },
  };

  return {
    formData,
    authState,
    passwordStrength,
    formFieldHandlers,
    authHandlers,
  };
};
