import { useCallback, useEffect, useState } from "react";
import { SecurityManager } from "../../../lib/security";
import UserProfileService from "../../../lib/user-profile";
import type { CoachingDetailsFormData } from "../../../lib/validations";
import AuthSecurityMiddleware from "../../../middleware/authSecurity";
import type {
  AuthFormData,
  AuthHandlers,
  AuthState,
  FormFieldHandlers,
  PasswordStrength,
} from "../types";
import { clearSignupFields, validateForm } from "../utils";
import { enhancedAuthService } from "../utils/enhancedAuthService";
import { useAutoFillDetection } from "./useAutoFillDetection";

export const useAuthForm = () => {
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
  const authService = enhancedAuthService;
  const securityManager = SecurityManager.getInstance();
  const securityMiddleware = AuthSecurityMiddleware.getInstance();

  // Auto-fill detection callback
  const handleAutoFillDetected = useCallback(() => {
    // Small delay to ensure DOM values are updated
    setTimeout(() => {
      // Get actual values from DOM elements
      const emailInput = document.querySelector(
        'input[type="email"]'
      ) as HTMLInputElement;
      const passwordInput = document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;

      if (emailInput && passwordInput) {
        const currentFormData = {
          ...formData,
          email: emailInput.value,
          password: passwordInput.value,
        };

        // Update form data if different
        if (
          currentFormData.email !== formData.email ||
          currentFormData.password !== formData.password
        ) {
          setFormData(currentFormData);
        }

        const isValid = validateForm(
          authState.isLogin,
          currentFormData,
          passwordStrength
        );
        setAuthState((prev) => ({ ...prev, isFormValid: isValid }));
      }
    }, 100);
  }, [authState.isLogin, formData, passwordStrength]);

  // Use auto-fill detection hook
  useAutoFillDetection({
    onAutoFillDetected: handleAutoFillDetected,
    targetSelectors: [
      'input[type="email"]',
      'input[type="password"]',
      'input[name="email"]',
      'input[name="password"]',
    ],
  });

  // Check account lockout on component mount and email change
  useEffect(() => {
    if (formData.email) {
      const isLocked = securityManager.isAccountLocked(formData.email);
      if (isLocked) {
        securityManager.getRemainingLockoutTime(formData.email);
        // Account locked - no console logging in production
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

  // Additional periodic validation check for auto-fill scenarios
  useEffect(() => {
    const interval = setInterval(() => {
      const emailInput = document.querySelector(
        'input[type="email"]'
      ) as HTMLInputElement;
      const passwordInput = document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;

      if (emailInput && passwordInput) {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;

        // Check if DOM values differ from state (indicates auto-fill)
        if (
          emailValue !== formData.email.trim() ||
          passwordValue !== formData.password
        ) {
          const updatedFormData = {
            ...formData,
            email: emailValue,
            password: passwordValue,
          };

          setFormData(updatedFormData);

          const isValid = validateForm(
            authState.isLogin,
            updatedFormData,
            passwordStrength
          );
          setAuthState((prev) => ({ ...prev, isFormValid: isValid }));
        } else {
          // Even if values haven't changed, revalidate in case password strength changed
          const isValid = validateForm(
            authState.isLogin,
            formData,
            passwordStrength
          );
          if (authState.isFormValid !== isValid) {
            setAuthState((prev) => ({ ...prev, isFormValid: isValid }));
          }
        }
      }
    }, 300); // Check every 300ms

    return () => clearInterval(interval);
  }, [authState.isLogin, authState.isFormValid]); // Simplified dependencies to avoid infinite loops

  // Initial validation check on mount (for immediate auto-fill detection)
  useEffect(() => {
    const checkInitialValues = () => {
      const emailInput = document.querySelector(
        'input[type="email"]'
      ) as HTMLInputElement;
      const passwordInput = document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;

      if (emailInput && passwordInput) {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;

        if (emailValue || passwordValue) {
          const updatedFormData = {
            ...formData,
            email: emailValue,
            password: passwordValue,
          };

          setFormData(updatedFormData);

          const isValid = validateForm(
            authState.isLogin,
            updatedFormData,
            passwordStrength
          );
          setAuthState((prev) => ({ ...prev, isFormValid: isValid }));
        }
      }
    };

    // Check immediately and after small delays to catch different auto-fill timings
    checkInitialValues();
    setTimeout(checkInitialValues, 100);
    setTimeout(checkInitialValues, 500);
    setTimeout(checkInitialValues, 1000);
  }, []); // Only run on mount

  // Form field handlers with validation trigger
  const formFieldHandlers: FormFieldHandlers = {
    setEmail: (value: string) => {
      setFormData((prev) => {
        const newFormData = { ...prev, email: value };
        // Trigger validation with the actual new data
        setTimeout(() => {
          const isValid = validateForm(
            authState.isLogin,
            newFormData,
            passwordStrength
          );
          setAuthState((prevState) => ({ ...prevState, isFormValid: isValid }));
        }, 10);
        return newFormData;
      });
    },
    setPassword: (value: string) => {
      setFormData((prev) => {
        const newFormData = { ...prev, password: value };
        // Trigger validation with the actual new data
        setTimeout(() => {
          const isValid = validateForm(
            authState.isLogin,
            newFormData,
            passwordStrength
          );
          setAuthState((prevState) => ({ ...prevState, isFormValid: isValid }));
        }, 10);
        return newFormData;
      });
    },
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

      // Check rate limiting
      const action = authState.isLogin ? "login" : "signup";
      if (!securityMiddleware.checkRateLimit(formData.email, action)) {
        const remaining = securityMiddleware.getRateLimitRemaining(
          formData.email,
          action
        );
        const minutes = Math.ceil(remaining / 60000);
        setAuthState((prev) => ({
          ...prev,
          error: `Too many attempts. Please try again in ${minutes} minutes.`,
        }));
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        loading: true,
        error: "",
        validationErrors: {},
      }));

      try {
        if (authState.isLogin) {
          await authService.signInWithEmail(formData.email, formData.password);

          // Login successful - clear any errors and show success state briefly
          setAuthState((prev) => ({
            ...prev,
            error: "",
            validationErrors: {},
          }));

          // Allow Firebase Auth state to propagate
          // The AuthContext will automatically handle the redirect
        } else {
          const result = await authService.signUpWithEmail(
            formData,
            passwordStrength
          );
          if (result.isNewUser) {
            // Create secure session for new user
            securityMiddleware.createSession(result.user);

            // Show success message with email verification guidance
            setAuthState((prev) => ({
              ...prev,
              error: "", // Clear any errors
              // We could add a success state here for showing email verification guidance
            }));
          }
        }
      } catch (error: unknown) {
        const err = error as { message: string };
        setAuthState((prev) => ({ ...prev, error: err.message }));
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },

    handleGoogleAuth: async () => {
      setAuthState((prev) => ({ ...prev, googleLoading: true, error: "" }));

      try {
        const result = await authService.signInWithGoogle();

        // Handle redirect result if popup was blocked
        if (!result.user) {
          // The auth will continue with redirect, no need to handle here
          return;
        }

        const { user, needsDetails } = result;

        // Auto-fill available Google profile information
        if (user.displayName && !formData.name) {
          formFieldHandlers.setName(user.displayName);
        }
        if (user.email && !formData.email) {
          formFieldHandlers.setEmail(user.email);
        }

        // Let Firebase Auth state propagate naturally
        // If user needs coaching details, it will be handled at the App level
        console.log("✅ Google authentication successful for:", user.email);

        if (needsDetails) {
          console.log("ℹ️ User needs to complete coaching details");
        } else {
          console.log("✅ User profile is complete");
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        const errorMessage = err.message || "Google authentication failed";
        setAuthState((prev) => ({ ...prev, error: errorMessage }));
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
      } catch (error: unknown) {
        const err = error as { message: string };
        setAuthState((prev) => ({ ...prev, error: err.message }));
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

        // Store the user email for logging before clearing pendingUser
        const userEmail = authState.pendingUser.email;

        // Close modal but keep pendingUser until AuthContext takes over
        setAuthState((prev) => ({
          ...prev,
          showCoachingModal: false,
          error: "", // Clear any errors
          // Don't clear pendingUser immediately - let AuthContext handle the transition
        }));

        // Don't clear form data - keep auth-related fields intact
        // Only clear coaching-specific fields that are no longer needed
        setFormData((prev) => ({
          ...prev,
          // Keep email, password, and name for potential re-authentication
          confirmPassword: "",
          coachingName: details.coachingName, // Keep the saved coaching name
          phoneNumber: details.phoneNumber, // Keep the saved phone number
          coachingLogo: details.coachingLogo || "",
        }));

        // Coaching details saved successfully - user should now be fully authenticated
        console.log(
          "✅ Coaching details saved successfully for user:",
          userEmail
        );

        // Give a small delay to ensure Firestore update has propagated
        // then clear the pending user to let AuthContext take over
        setTimeout(() => {
          setAuthState((prev) => ({
            ...prev,
            pendingUser: null,
          }));
        }, 500);

        // The AuthContext will automatically handle the authentication state
        // and redirect the user to the appropriate screen since the user
        // is already authenticated via Firebase
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
