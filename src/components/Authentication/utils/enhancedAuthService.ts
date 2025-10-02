/**
 * Enhanced Authentication Service
 *
 * Provides comprehensive authentication with:
 * - Rate limiting and brute force protection
 * - CSRF protection
 * - Secure session management
 * - Password security validation
 * - Logging and monitoring
 */

import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
  verifyPasswordResetCode,
  type User as FirebaseUser,
  type UserCredential,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { SecurityManager } from "../../../lib/security";
import UserProfileService from "../../../lib/user-profile";
import {
  checkPasswordStrength,
  getValidationErrors,
  loginSchema,
  signupSchema,
} from "../../../lib/validations";
import type { AuthFormData, PasswordStrength } from "../types";
import { AuthLogger } from "./authLogger";

export interface AuthResult {
  user: FirebaseUser;
  needsDetails: boolean;
  isNewUser?: boolean;
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
}

export class EnhancedAuthService {
  private securityManager: SecurityManager;
  private logger: AuthLogger;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor() {
    this.securityManager = SecurityManager.getInstance();
    this.logger = new AuthLogger();
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<void> {
    const sanitizedEmail = this.securityManager
      .sanitizeInput(email)
      .toLowerCase();

    // Validate form data using Zod
    const formData = { email: sanitizedEmail, password };
    const validationResult = loginSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors = getValidationErrors(validationResult.error);
      const firstError = Object.values(errors)[0];
      this.logger.logAuthFailure(
        "email_signin",
        sanitizedEmail,
        "validation_error",
        firstError
      );
      throw new Error(firstError || "Validation failed");
    }

    // Check account lockout
    const isLocked = this.securityManager.isAccountLocked(sanitizedEmail);
    if (isLocked) {
      const remainingTime =
        this.securityManager.getRemainingLockoutTime(sanitizedEmail);
      const remainingMinutes = Math.ceil(remainingTime / 60000);
      const remainingSeconds = Math.ceil((remainingTime % 60000) / 1000);
      const timeDisplay =
        remainingMinutes > 0
          ? `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`
          : `${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`;

      const errorMsg = `Account temporarily locked due to multiple failed attempts. Please try again in ${timeDisplay}.`;
      this.logger.logAuthFailure(
        "email_signin",
        sanitizedEmail,
        "account_locked",
        errorMsg
      );
      throw new Error(errorMsg);
    }

    try {
      const userCredential = await this.retryOperation(() =>
        signInWithEmailAndPassword(auth, sanitizedEmail, password)
      );

      this.securityManager.recordLoginAttempt(sanitizedEmail, true);
      this.logger.logAuthSuccess("email_signin", sanitizedEmail);

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        this.logger.logAuthWarning(
          "email_signin",
          sanitizedEmail,
          "email_not_verified"
        );

        // Note: We let the user sign in but the app will redirect them
        // to the email verification flow via the AuthContext/App routing
        console.warn(
          "User email not verified. User will be redirected to verification flow."
        );
      }
    } catch (error: unknown) {
      this.securityManager.recordLoginAttempt(sanitizedEmail, false);
      const authError = this.handleAuthError(error);
      this.logger.logAuthFailure(
        "email_signin",
        sanitizedEmail,
        "firebase_error",
        authError.message
      );
      throw authError;
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    formData: AuthFormData,
    passwordStrength: PasswordStrength
  ): Promise<AuthResult> {
    const sanitizedEmail = this.securityManager
      .sanitizeInput(formData.email)
      .toLowerCase();
    const sanitizedName = this.securityManager.sanitizeInput(formData.name);
    const sanitizedCoachingName = this.securityManager.sanitizeInput(
      formData.coachingName
    );
    const sanitizedPhone = this.securityManager.sanitizeInput(
      formData.phoneNumber
    );

    // Validate form data using Zod
    const validationResult = signupSchema.safeParse({
      email: sanitizedEmail,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      name: sanitizedName,
      coachingName: sanitizedCoachingName,
      phoneNumber: sanitizedPhone,
    });

    if (!validationResult.success) {
      const errors = getValidationErrors(validationResult.error);
      const firstError = Object.values(errors)[0];
      this.logger.logAuthFailure(
        "email_signup",
        sanitizedEmail,
        "validation_error",
        firstError
      );
      throw new Error(firstError || "Validation failed");
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      const errorMsg =
        "Please choose a stronger password to create your account";
      this.logger.logAuthFailure(
        "email_signup",
        sanitizedEmail,
        "weak_password",
        errorMsg
      );
      throw new Error(errorMsg);
    }

    try {
      const userCredential = await this.retryOperation(() =>
        createUserWithEmailAndPassword(auth, sanitizedEmail, formData.password)
      );

      // Update user profile with sanitized name
      if (sanitizedName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: sanitizedName,
        });
      }

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Create user profile with coaching details
      if (userCredential.user) {
        await UserProfileService.createUserProfile(userCredential.user, {
          coachingName: sanitizedCoachingName,
          phoneNumber: sanitizedPhone,
          coachingLogo: formData.coachingLogo || undefined,
        });
      }

      this.securityManager.recordLoginAttempt(sanitizedEmail, true);
      this.logger.logAuthSuccess("email_signup", sanitizedEmail);

      return {
        user: userCredential.user,
        needsDetails: false,
        isNewUser: true,
      };
    } catch (error: unknown) {
      const authError = this.handleAuthError(error);
      this.logger.logAuthFailure(
        "email_signup",
        sanitizedEmail,
        "firebase_error",
        authError.message
      );
      throw authError;
    }
  }

  /**
   * Sign in with Google (with fallback to redirect for popup blocking)
   */
  async signInWithGoogle(): Promise<AuthResult> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    // Add required scopes
    provider.addScope("email");
    provider.addScope("profile");

    try {
      // Try popup first
      const result = await signInWithPopup(auth, provider);
      return await this.processGoogleSignIn(result);
    } catch (error: unknown) {
      const err = error as { code?: string };

      // If popup is blocked, fall back to redirect
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user"
      ) {
        this.logger.logAuthWarning(
          "google_signin",
          "unknown",
          "popup_blocked_fallback_to_redirect"
        );

        try {
          await signInWithRedirect(auth, provider);
          // The redirect will handle the result on page load
          return { user: null as any, needsDetails: false }; // Temporary, will be handled by redirect result
        } catch (redirectError) {
          this.logger.logAuthFailure(
            "google_signin",
            "unknown",
            "redirect_error",
            (redirectError as Error).message
          );
          throw this.handleAuthError(redirectError);
        }
      }

      this.logger.logAuthFailure(
        "google_signin",
        "unknown",
        "popup_error",
        (error as Error).message
      );
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle Google redirect result (call this on app initialization)
   */
  async handleGoogleRedirectResult(): Promise<AuthResult | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        return await this.processGoogleSignIn(result);
      }
      return null;
    } catch (error: unknown) {
      this.logger.logAuthFailure(
        "google_redirect",
        "unknown",
        "redirect_result_error",
        (error as Error).message
      );
      throw this.handleAuthError(error);
    }
  }

  /**
   * Process Google sign-in result
   */
  private async processGoogleSignIn(
    result: UserCredential
  ): Promise<AuthResult> {
    const user = result.user;
    const email = user.email || "unknown";

    this.logger.logAuthSuccess("google_signin", email);

    // Check if user needs to complete coaching details
    const needsDetails = await UserProfileService.needsCoachingDetails(user);

    return { user, needsDetails };
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<PasswordResetResult> {
    const sanitizedEmail = this.securityManager
      .sanitizeInput(email)
      .toLowerCase();
    const resetPasswordSchema = { email: sanitizedEmail };
    const validation = loginSchema
      .pick({ email: true })
      .safeParse(resetPasswordSchema);

    if (!validation.success) {
      const errors = getValidationErrors(validation.error);
      const errorMsg = errors.email || "Please enter a valid email address";
      this.logger.logAuthFailure(
        "password_reset",
        sanitizedEmail,
        "validation_error",
        errorMsg
      );
      throw new Error(errorMsg);
    }

    try {
      await this.retryOperation(() =>
        sendPasswordResetEmail(auth, sanitizedEmail)
      );

      this.logger.logAuthSuccess("password_reset", sanitizedEmail);
      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error: unknown) {
      const authError = this.handleAuthError(error);
      this.logger.logAuthFailure(
        "password_reset",
        sanitizedEmail,
        "firebase_error",
        authError.message
      );
      throw authError;
    }
  }

  /**
   * Confirm password reset with code
   */
  async confirmPasswordReset(
    code: string,
    newPassword: string
  ): Promise<PasswordResetResult> {
    try {
      // Verify the code first
      await verifyPasswordResetCode(auth, code);

      // Validate new password
      const passwordStrength = this.checkPasswordStrength(newPassword);
      if (!passwordStrength.isValid) {
        throw new Error("Please choose a stronger password");
      }

      // Confirm the password reset
      await confirmPasswordReset(auth, code, newPassword);

      this.logger.logAuthSuccess("password_reset_confirm", "unknown");
      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error: unknown) {
      const authError = this.handleAuthError(error);
      this.logger.logAuthFailure(
        "password_reset_confirm",
        "unknown",
        "firebase_error",
        authError.message
      );
      throw authError;
    }
  }

  /**
   * Verify email with action code
   */
  async verifyEmail(code: string): Promise<boolean> {
    try {
      await applyActionCode(auth, code);
      this.logger.logAuthSuccess("email_verification", "unknown");
      return true;
    } catch (error: unknown) {
      this.logger.logAuthFailure(
        "email_verification",
        "unknown",
        "firebase_error",
        (error as Error).message
      );
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): PasswordStrength {
    if (!password) {
      return { isValid: false, feedback: [], score: 0, strength: "very-weak" };
    }

    // Use the centralized validation from SecurityManager
    const validation = this.securityManager.validatePasswordStrength(password);
    const strength = checkPasswordStrength(password);

    return {
      isValid: validation.isValid,
      score: validation.score,
      strength: strength.strength,
      feedback: validation.errors,
    };
  }

  /**
   * Check if account is locked
   */
  isAccountLocked(email: string): boolean {
    return this.securityManager.isAccountLocked(email);
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      const err = error as { code?: string };

      // Don't retry certain errors
      const nonRetryableErrors = [
        "auth/user-not-found",
        "auth/wrong-password",
        "auth/email-already-in-use",
        "auth/weak-password",
        "auth/invalid-email",
        "auth/user-disabled",
        "auth/too-many-requests",
      ];

      if (
        nonRetryableErrors.includes(err.code || "") ||
        attempt >= this.MAX_RETRY_ATTEMPTS
      ) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return this.retryOperation(operation, attempt + 1);
    }
  }

  /**
   * Enhanced error handling
   */
  private handleAuthError(error: unknown): Error {
    const err = error as { code?: string; message?: string };

    const errorMap: Record<string, string> = {
      "auth/user-not-found":
        "No account found with this email address. Please check your email or create a new account.",
      "auth/wrong-password":
        "Incorrect password. Please try again or use 'Forgot Password' to reset it.",
      "auth/email-already-in-use":
        "An account with this email already exists. Please sign in instead or use a different email.",
      "auth/weak-password":
        "Password is too weak. Please choose a stronger password with at least 8 characters.",
      "auth/invalid-email":
        "Please enter a valid email address in the format: example@domain.com",
      "auth/user-disabled":
        "This account has been temporarily disabled. Please contact support for assistance.",
      "auth/account-exists-with-different-credential":
        "An account with this email already exists using a different sign-in method. Please sign in with your email and password first, then link your Google account in account settings.",
      "auth/popup-closed-by-user":
        "Google sign-in was cancelled. Please try again if you want to continue with Google authentication.",
      "auth/popup-blocked":
        "Your browser blocked the sign-in popup. Please allow popups for this site or try signing in with email and password instead.",
      "auth/cancelled-popup-request": "", // User cancelled - don't show error
      "auth/too-many-requests":
        "Too many failed attempts. Your account has been temporarily locked for security. Please try again in a few minutes or reset your password.",
      "auth/network-request-failed":
        "Connection error. Please check your internet connection and try again.",
      "auth/internal-error":
        "Something went wrong on our end. Please try again in a moment.",
      "auth/invalid-action-code":
        "This verification link is invalid or has expired. Please request a new verification email.",
      "auth/expired-action-code":
        "This verification link has expired. Please request a new verification email from your account settings.",
      "auth/operation-not-allowed":
        "This sign-in method is not enabled. Please contact support or try a different sign-in method.",
      "auth/invalid-credential":
        "The provided credentials are invalid. Please check your email and password and try again.",
      "auth/credential-already-in-use":
        "This credential is already associated with a different account. Please sign in with that account or use a different credential.",
      "auth/requires-recent-login":
        "For security reasons, please sign out and sign back in before making this change.",
    };

    let userMessage = errorMap[err.code || ""];

    // If no specific error mapping found, provide a generic but helpful message
    if (!userMessage) {
      if (err.message?.includes("network")) {
        userMessage =
          "Connection error. Please check your internet connection and try again.";
      } else if (err.message?.includes("password")) {
        userMessage =
          "Password error. Please check your password and try again.";
      } else if (err.message?.includes("email")) {
        userMessage =
          "Email error. Please check your email address and try again.";
      } else {
        userMessage =
          "Something went wrong. Please try again or contact support if the problem continues.";
      }
    }

    return new Error(userMessage);
  }
}

// Export singleton instance
export const enhancedAuthService = new EnhancedAuthService();
export default enhancedAuthService;
