/**
 * Authentication Logger
 *
 * Provides comprehensive logging for authentication events
 * including security monitoring and audit trails
 */

export type AuthEventType =
  | "email_signin"
  | "email_signup"
  | "google_signin"
  | "google_redirect"
  | "password_reset"
  | "password_reset_confirm"
  | "email_verification"
  | "logout"
  | "session_expired";

export type AuthEventStatus = "success" | "failure" | "warning";

export interface AuthLogEntry {
  timestamp: string;
  eventType: AuthEventType;
  status: AuthEventStatus;
  email: string;
  errorType?: string;
  message?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

export class AuthLogger {
  private readonly storageKey = "mockify-auth-logs";
  private readonly maxLogEntries = 1000;

  constructor() {
    this.initializeLogging();
  }

  /**
   * Initialize logging system
   */
  private initializeLogging(): void {
    // Clean up old logs periodically
    this.cleanupOldLogs();
  }

  /**
   * Log successful authentication event
   */
  logAuthSuccess(
    eventType: AuthEventType,
    email: string,
    additionalData?: Record<string, any>
  ): void {
    const entry: AuthLogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      status: "success",
      email: this.maskEmail(email),
      userAgent: navigator.userAgent,
      sessionId: this.generateSessionId(),
      ...additionalData,
    };

    this.writeLog(entry);

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log(
        `✅ Auth Success: ${eventType} for ${this.maskEmail(email)}`,
        entry
      );
    }
  }

  /**
   * Log failed authentication event
   */
  logAuthFailure(
    eventType: AuthEventType,
    email: string,
    errorType: string,
    message: string,
    additionalData?: Record<string, any>
  ): void {
    const entry: AuthLogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      status: "failure",
      email: this.maskEmail(email),
      errorType,
      message,
      userAgent: navigator.userAgent,
      sessionId: this.generateSessionId(),
      ...additionalData,
    };

    this.writeLog(entry);

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error(
        `❌ Auth Failure: ${eventType} for ${this.maskEmail(email)}`,
        entry
      );
    }

    // Check for suspicious activity
    this.checkSuspiciousActivity(email, errorType);
  }

  /**
   * Log authentication warning
   */
  logAuthWarning(
    eventType: AuthEventType,
    email: string,
    message: string,
    additionalData?: Record<string, any>
  ): void {
    const entry: AuthLogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      status: "warning",
      email: this.maskEmail(email),
      message,
      userAgent: navigator.userAgent,
      sessionId: this.generateSessionId(),
      ...additionalData,
    };

    this.writeLog(entry);

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.warn(
        `⚠️ Auth Warning: ${eventType} for ${this.maskEmail(email)}`,
        entry
      );
    }
  }

  /**
   * Get authentication logs
   */
  getAuthLogs(limit: number = 100): AuthLogEntry[] {
    try {
      const logs = localStorage.getItem(this.storageKey);
      if (!logs) return [];

      const parsedLogs: AuthLogEntry[] = JSON.parse(logs);
      return parsedLogs.slice(-limit).reverse(); // Return most recent first
    } catch (error) {
      console.error("Error reading auth logs:", error);
      return [];
    }
  }

  /**
   * Get authentication statistics
   */
  getAuthStats(hours: number = 24): {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    uniqueEmails: Set<string>;
    suspiciousActivity: AuthLogEntry[];
  } {
    const logs = this.getAuthLogs();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const recentLogs = logs.filter(
      (log) => new Date(log.timestamp) > cutoffTime
    );

    const uniqueEmails = new Set(recentLogs.map((log) => log.email));
    const suspiciousActivity = recentLogs.filter(
      (log) =>
        log.status === "failure" &&
        ["brute_force", "account_locked", "multiple_failures"].includes(
          log.errorType || ""
        )
    );

    return {
      totalAttempts: recentLogs.length,
      successfulAttempts: recentLogs.filter((log) => log.status === "success")
        .length,
      failedAttempts: recentLogs.filter((log) => log.status === "failure")
        .length,
      uniqueEmails,
      suspiciousActivity,
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): string {
    const logs = this.getAuthLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Write log entry to storage
   */
  private writeLog(entry: AuthLogEntry): void {
    try {
      const existingLogs = this.getAuthLogs();
      const updatedLogs = [...existingLogs, entry];

      // Keep only the most recent entries
      if (updatedLogs.length > this.maxLogEntries) {
        updatedLogs.splice(0, updatedLogs.length - this.maxLogEntries);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error("Error writing auth log:", error);
    }
  }

  /**
   * Mask email for privacy
   */
  private maskEmail(email: string): string {
    if (!email || email === "unknown") return email;

    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;

    const maskedLocal =
      localPart.length > 2
        ? localPart[0] +
          "*".repeat(localPart.length - 2) +
          localPart[localPart.length - 1]
        : localPart;

    return `${maskedLocal}@${domain}`;
  }

  /**
   * Generate session ID for tracking
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check for suspicious authentication activity
   */
  private checkSuspiciousActivity(email: string, errorType: string): void {
    const recentLogs = this.getAuthLogs(50);
    const emailLogs = recentLogs.filter(
      (log) => log.email === this.maskEmail(email)
    );
    const recentFailures = emailLogs.filter(
      (log) =>
        log.status === "failure" &&
        new Date(log.timestamp) > new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
    );

    // Check for brute force attempts
    if (recentFailures.length >= 5) {
      this.logAuthWarning(
        "email_signin",
        email,
        "Potential brute force attack detected",
        {
          failureCount: recentFailures.length,
          timeWindow: "10 minutes",
        }
      );
    }

    // Check for account enumeration attempts
    if (errorType === "user-not-found") {
      const userNotFoundAttempts = recentLogs.filter(
        (log) =>
          log.errorType === "user-not-found" &&
          new Date(log.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      );

      if (userNotFoundAttempts.length >= 10) {
        this.logAuthWarning(
          "email_signin",
          "unknown",
          "Potential account enumeration detected",
          {
            attemptCount: userNotFoundAttempts.length,
          }
        );
      }
    }
  }

  /**
   * Clean up old logs
   */
  private cleanupOldLogs(): void {
    try {
      const logs = this.getAuthLogs();
      const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

      const recentLogs = logs.filter(
        (log) => new Date(log.timestamp) > cutoffTime
      );

      if (recentLogs.length !== logs.length) {
        localStorage.setItem(this.storageKey, JSON.stringify(recentLogs));
      }
    } catch (error) {
      console.error("Error cleaning up old logs:", error);
    }
  }
}
