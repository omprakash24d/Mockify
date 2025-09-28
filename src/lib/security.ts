import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  type User as FirebaseUser,
  type MultiFactorError,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export interface LoginAttempt {
  timestamp: number;
  email: string;
  success: boolean;
  ip?: string;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private maxLoginAttempts: number;
  private lockoutDuration: number;

  private constructor() {
    this.maxLoginAttempts = parseInt(
      import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || "5"
    );
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Track login attempts
  public recordLoginAttempt(email: string, success: boolean): boolean {
    const attempts = this.getLoginAttempts();
    const now = Date.now();

    // Clean old attempts (older than lockout duration)
    const recentAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < this.lockoutDuration
    );

    // Add current attempt
    recentAttempts.push({
      timestamp: now,
      email: email.toLowerCase(),
      success,
    });

    // Store updated attempts
    localStorage.setItem(
      "mockify-loginAttempts",
      JSON.stringify(recentAttempts)
    );

    // Check if user is locked out
    const failedAttempts = recentAttempts.filter(
      (attempt) => !attempt.success && attempt.email === email.toLowerCase()
    );

    return failedAttempts.length < this.maxLoginAttempts;
  }

  public isAccountLocked(email: string): boolean {
    const attempts = this.getLoginAttempts();
    const now = Date.now();

    const recentFailedAttempts = attempts.filter(
      (attempt) =>
        !attempt.success &&
        attempt.email === email.toLowerCase() &&
        now - attempt.timestamp < this.lockoutDuration
    );

    return recentFailedAttempts.length >= this.maxLoginAttempts;
  }

  public getRemainingLockoutTime(email: string): number {
    const attempts = this.getLoginAttempts();
    const failedAttempts = attempts.filter(
      (attempt) => !attempt.success && attempt.email === email.toLowerCase()
    );

    if (failedAttempts.length >= this.maxLoginAttempts) {
      const oldestRelevantAttempt = failedAttempts.slice(
        -this.maxLoginAttempts
      )[0];
      const lockoutEnd = oldestRelevantAttempt.timestamp + this.lockoutDuration;
      return Math.max(0, lockoutEnd - Date.now());
    }

    return 0;
  }

  private getLoginAttempts(): LoginAttempt[] {
    try {
      const stored = localStorage.getItem("mockify-loginAttempts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // 2FA Methods
  public async enrollPhoneNumber(
    user: FirebaseUser,
    phoneNumber: string
  ): Promise<string> {
    try {
      const multiFactorUser = multiFactor(user);
      const phoneAuthCredential = PhoneAuthProvider.credential(
        phoneNumber,
        "" // This would be filled by the verification process
      );

      const multiFactorAssertion =
        PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

      await multiFactorUser.enroll(multiFactorAssertion, "Phone Number");
      return "Phone number enrolled successfully for 2FA";
    } catch (error: any) {
      throw new Error(`Failed to enroll phone number: ${error.message}`);
    }
  }

  public async setupRecaptcha(elementId: string): Promise<RecaptchaVerifier> {
    return new RecaptchaVerifier(auth, elementId, {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA solved");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired");
      },
    });
  }

  public async handleMultiFactorError(error: MultiFactorError): Promise<void> {
    // This would handle the multi-factor authentication flow
    console.log("Multi-factor authentication required:", error);
    // Implementation would depend on your specific 2FA flow
  }

  // Security validation
  public validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    } else {
      score += 1;
    }

    // Check for common weak passwords
    const commonPasswords = [
      "password",
      "123456",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
      "qwerty",
      "abc123",
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("Password is too common");
      score = Math.max(0, score - 2);
    }

    return {
      isValid: errors.length === 0,
      errors,
      score,
    };
  }

  // XSS and input sanitization
  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim();
  }

  // Rate limiting for API calls
  private rateLimitMap = new Map<
    string,
    { count: number; resetTime: number }
  >();

  public checkRateLimit(
    key: string,
    maxRequests: number = 10,
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }
}
