/**
 * Enhanced Authentication Middleware
 *
 * Provides CSRF protection, rate limiting, and session management
 * for client-side authentication security
 */

import type { User } from "firebase/auth";
import { auth } from "../lib/firebase";

export interface SecurityConfig {
  enableCSRFProtection: boolean;
  enableRateLimit: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export interface SessionData {
  userId: string;
  email: string;
  lastActivity: number;
  sessionId: string;
  csrfToken?: string;
}

export class AuthSecurityMiddleware {
  private static instance: AuthSecurityMiddleware;
  private config: SecurityConfig;
  private rateLimitStore = new Map<
    string,
    { count: number; resetTime: number }
  >();
  private sessionStore = new Map<string, SessionData>();
  private csrfTokens = new Set<string>();

  private constructor() {
    this.config = {
      enableCSRFProtection: true,
      enableRateLimit: true,
      sessionTimeout: parseInt(
        import.meta.env.VITE_SESSION_TIMEOUT || "86400000"
      ), // 24 hours
      maxLoginAttempts: parseInt(
        import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || "5"
      ),
    };

    // Initialize session cleanup
    this.initSessionCleanup();
  }

  public static getInstance(): AuthSecurityMiddleware {
    if (!AuthSecurityMiddleware.instance) {
      AuthSecurityMiddleware.instance = new AuthSecurityMiddleware();
    }
    return AuthSecurityMiddleware.instance;
  }

  /**
   * Generate CSRF token for form protection
   */
  generateCSRFToken(): string {
    const token = `csrf_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 16)}`;
    this.csrfTokens.add(token);

    // Auto-cleanup old tokens after 1 hour
    setTimeout(() => {
      this.csrfTokens.delete(token);
    }, 3600000);

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string): boolean {
    if (!this.config.enableCSRFProtection) return true;

    const isValid = this.csrfTokens.has(token);
    if (isValid) {
      this.csrfTokens.delete(token); // Single use token
    }
    return isValid;
  }

  /**
   * Check rate limit for authentication attempts
   */
  checkRateLimit(
    identifier: string,
    action: "login" | "signup" | "reset"
  ): boolean {
    if (!this.config.enableRateLimit) return true;

    const key = `${action}_${identifier}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    let maxAttempts = this.config.maxLoginAttempts;
    if (action === "reset") maxAttempts = 3; // Stricter for password reset
    if (action === "signup") maxAttempts = 2; // Stricter for signup

    const entry = this.rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count >= maxAttempts) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining time for rate limit
   */
  getRateLimitRemaining(
    identifier: string,
    action: "login" | "signup" | "reset"
  ): number {
    const key = `${action}_${identifier}`;
    const entry = this.rateLimitStore.get(key);

    if (!entry) return 0;

    const remaining = entry.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Create secure session
   */
  createSession(user: User): SessionData {
    const sessionData: SessionData = {
      userId: user.uid,
      email: user.email || "",
      lastActivity: Date.now(),
      sessionId: this.generateSessionId(),
      csrfToken: this.generateCSRFToken(),
    };

    this.sessionStore.set(user.uid, sessionData);

    // Store in localStorage with encryption
    this.storeSessionSecurely(sessionData);

    return sessionData;
  }

  /**
   * Validate and refresh session
   */
  validateSession(userId: string): SessionData | null {
    const session = this.sessionStore.get(userId);

    if (!session) {
      // Try to restore from localStorage
      const storedSession = this.getStoredSession();
      if (storedSession && storedSession.userId === userId) {
        this.sessionStore.set(userId, storedSession);
        return storedSession;
      }
      return null;
    }

    const now = Date.now();
    const isExpired = now - session.lastActivity > this.config.sessionTimeout;

    if (isExpired) {
      this.destroySession(userId);
      return null;
    }

    // Update last activity
    session.lastActivity = now;
    this.storeSessionSecurely(session);

    return session;
  }

  /**
   * Update session activity
   */
  updateSessionActivity(userId: string): void {
    const session = this.sessionStore.get(userId);
    if (session) {
      session.lastActivity = Date.now();
      this.storeSessionSecurely(session);
    }
  }

  /**
   * Destroy session
   */
  destroySession(userId: string): void {
    this.sessionStore.delete(userId);
    localStorage.removeItem("mockify_session");
    sessionStorage.removeItem("mockify_session_temp");
  }

  /**
   * Secure logout - clear all session data
   */
  async secureLogout(): Promise<void> {
    try {
      // Sign out from Firebase
      await auth.signOut();

      // Clear all sessions
      this.sessionStore.clear();

      // Clear localStorage
      localStorage.removeItem("mockify_session");
      sessionStorage.removeItem("mockify_session_temp");

      // Clear any remaining auth tokens
      localStorage.removeItem("mockify-loginAttempts");

      // Clear CSRF tokens
      this.csrfTokens.clear();

      console.log("Secure logout completed");
    } catch (error) {
      console.error("Error during secure logout:", error);
      throw error;
    }
  }

  /**
   * Detect potential session hijacking
   */
  detectSessionHijacking(sessionData: SessionData): boolean {
    // Check for unusual activity patterns
    const userAgent = navigator.userAgent;
    const storedUserAgent = sessionStorage.getItem("mockify_ua");

    if (storedUserAgent && storedUserAgent !== userAgent) {
      console.warn(
        "Potential session hijacking detected - User agent mismatch"
      );
      return true;
    }

    if (!storedUserAgent) {
      sessionStorage.setItem("mockify_ua", userAgent);
    }

    // Check for session timeout anomalies
    const activityGap = Date.now() - sessionData.lastActivity;
    if (activityGap < 0) {
      console.warn("Potential session hijacking detected - Time anomaly");
      return true;
    }

    return false;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 12);
    return `${timestamp}_${randomPart}`;
  }

  /**
   * Store session securely in localStorage
   */
  private storeSessionSecurely(sessionData: SessionData): void {
    try {
      // Simple encoding (in production, use proper encryption)
      const encoded = btoa(
        JSON.stringify({
          ...sessionData,
          checksum: this.generateChecksum(sessionData),
        })
      );
      localStorage.setItem("mockify_session", encoded);
    } catch (error) {
      console.error("Error storing session:", error);
    }
  }

  /**
   * Get stored session from localStorage
   */
  private getStoredSession(): SessionData | null {
    try {
      const encoded = localStorage.getItem("mockify_session");
      if (!encoded) return null;

      const decoded = JSON.parse(atob(encoded));

      // Verify checksum
      const expectedChecksum = this.generateChecksum({
        userId: decoded.userId,
        email: decoded.email,
        lastActivity: decoded.lastActivity,
        sessionId: decoded.sessionId,
        csrfToken: decoded.csrfToken,
      });

      if (decoded.checksum !== expectedChecksum) {
        console.warn("Session checksum mismatch - possible tampering");
        localStorage.removeItem("mockify_session");
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        lastActivity: decoded.lastActivity,
        sessionId: decoded.sessionId,
        csrfToken: decoded.csrfToken,
      };
    } catch (error) {
      console.error("Error reading stored session:", error);
      localStorage.removeItem("mockify_session");
      return null;
    }
  }

  /**
   * Generate checksum for session integrity
   */
  private generateChecksum(
    data: Omit<SessionData, "csrfToken"> & { csrfToken?: string }
  ): string {
    const str = `${data.userId}_${data.email}_${data.lastActivity}_${
      data.sessionId
    }_${data.csrfToken || ""}`;
    return btoa(str).substr(0, 16);
  }

  /**
   * Initialize periodic session cleanup
   */
  private initSessionCleanup(): void {
    // Clean up expired sessions every 10 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [userId, session] of this.sessionStore.entries()) {
        if (now - session.lastActivity > this.config.sessionTimeout) {
          this.destroySession(userId);
        }
      }

      // Clean up old rate limit entries
      for (const [key, entry] of this.rateLimitStore.entries()) {
        if (now > entry.resetTime) {
          this.rateLimitStore.delete(key);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Security headers for API requests
   */
  getSecurityHeaders(csrfToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };

    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    return headers;
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .replace(/data:/gi, "") // Remove data: protocol
      .trim();
  }
}

export default AuthSecurityMiddleware;
