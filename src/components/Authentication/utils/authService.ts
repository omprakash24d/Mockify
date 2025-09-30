import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User as FirebaseUser,
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

export class AuthService {
  private securityManager: SecurityManager;

  constructor() {
    this.securityManager = SecurityManager.getInstance();
  }

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

      throw new Error(
        `Account temporarily locked due to multiple failed attempts. Please try again in ${timeDisplay}.`
      );
    }

    try {
      await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      this.securityManager.recordLoginAttempt(sanitizedEmail, true);
    } catch (error: unknown) {
      this.securityManager.recordLoginAttempt(sanitizedEmail, false);
      throw this.handleAuthError(error);
    }
  }

  async signUpWithEmail(
    formData: AuthFormData,
    passwordStrength: PasswordStrength
  ): Promise<void> {
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
      throw new Error(firstError || "Validation failed");
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      throw new Error(
        "Please choose a stronger password to create your account"
      );
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sanitizedEmail,
        formData.password
      );

      // Update user profile with sanitized name
      if (sanitizedName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: sanitizedName,
        });
      }

      // Create user profile with coaching details
      if (userCredential.user) {
        await UserProfileService.createUserProfile(userCredential.user, {
          coachingName: sanitizedCoachingName,
          phoneNumber: sanitizedPhone,
          coachingLogo: formData.coachingLogo || undefined,
        });
      }

      this.securityManager.recordLoginAttempt(sanitizedEmail, true);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<{
    user: FirebaseUser;
    needsDetails: boolean;
  }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user needs to complete coaching details
      const needsDetails = await UserProfileService.needsCoachingDetails(user);

      return { user, needsDetails };
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    const resetPasswordSchema = { email: email.trim() };
    const validation = loginSchema
      .pick({ email: true })
      .safeParse(resetPasswordSchema);

    if (!validation.success) {
      const errors = getValidationErrors(validation.error);
      throw new Error(errors.email || "Please enter a valid email address");
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

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

  isAccountLocked(email: string): boolean {
    return this.securityManager.isAccountLocked(email);
  }

  private handleAuthError(error: unknown): Error {
    const err = error as { code?: string; message?: string };
    if (err.code === "auth/user-not-found") {
      return new Error("No account found with this email address");
    } else if (err.code === "auth/wrong-password") {
      return new Error("Incorrect password");
    } else if (err.code === "auth/email-already-in-use") {
      return new Error("An account with this email already exists");
    } else if (err.code === "auth/weak-password") {
      return new Error("Password is too weak");
    } else if (err.code === "auth/account-exists-with-different-credential") {
      return new Error(
        "An account already exists with this email. Please sign in with your email and password first, then link your Google account in settings."
      );
    } else if (err.code === "auth/popup-closed-by-user") {
      return new Error(
        "Google sign-in was cancelled. Please try again if you want to continue with Google."
      );
    } else if (err.code === "auth/popup-blocked") {
      return new Error(
        "Sign-in popup was blocked by your browser. Please allow popups and try again."
      );
    } else if (err.code === "auth/cancelled-popup-request") {
      // User cancelled - don't show error for this
      return new Error("");
    } else if (err.code === "auth/too-many-requests") {
      return new Error(
        "Too many password reset attempts. Please try again later."
      );
    } else {
      return new Error(err.message || "An error occurred");
    }
  }
}
