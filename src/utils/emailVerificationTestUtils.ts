/**
 * Email Verification Test Utils
 *
 * Utility functions for testing email verification functionality
 */

import { AuthLogger } from "../components/Authentication/utils/authLogger";
import AuthSecurityMiddleware from "../middleware/authSecurity";

export class EmailVerificationTestUtils {
  private static authLogger = new AuthLogger();
  private static securityMiddleware = AuthSecurityMiddleware.getInstance();

  /**
   * Simulate an unverified user scenario for testing
   */
  static simulateUnverifiedUser(): void {
    console.log("🧪 Testing: Email Verification System");
    console.log("=====================================");

    // Test logging
    this.authLogger.logAuthSuccess("email_signin", "test@example.com");
    this.authLogger.logAuthWarning(
      "email_signin",
      "test@example.com",
      "email_not_verified"
    );

    console.log("✅ Authentication logs created");

    // Test rate limiting
    const canResend = this.securityMiddleware.checkRateLimit(
      "test@example.com",
      "reset"
    );
    console.log(`✅ Rate limiting check: ${canResend ? "Allowed" : "Blocked"}`);

    // Test session management
    const csrfToken = this.securityMiddleware.generateCSRFToken();
    console.log(`✅ CSRF token generated: ${csrfToken.substring(0, 20)}...`);

    // Show recent logs
    const recentLogs = this.authLogger.getAuthLogs(5);
    console.log("📊 Recent authentication logs:");
    recentLogs.forEach((log) => {
      console.log(
        `   ${log.timestamp}: ${log.eventType} - ${log.status} - ${log.email}`
      );
    });

    // Show authentication stats
    const stats = this.authLogger.getAuthStats(24);
    console.log("📈 Authentication Statistics (24h):");
    console.log(`   Total attempts: ${stats.totalAttempts}`);
    console.log(`   Successful: ${stats.successfulAttempts}`);
    console.log(`   Failed: ${stats.failedAttempts}`);
    console.log(`   Unique emails: ${stats.uniqueEmails.size}`);
  }

  /**
   * Test email verification flow components
   */
  static testVerificationFlow(): void {
    console.log("🧪 Testing: Email Verification Flow");
    console.log("===================================");

    // Test scenarios
    const scenarios = [
      "New user registration with email verification",
      "Existing user resending verification email",
      "User clicking verification link from email",
      "User accessing app with unverified email",
      "Rate limiting verification email requests",
    ];

    scenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario}`);
    });

    console.log("\n🎯 Expected Behaviors:");
    console.log("- Banner shows for unverified users");
    console.log("- Resend button works with cooldown");
    console.log("- Verification links redirect properly");
    console.log("- Rate limiting prevents spam");
    console.log("- Success/error messages display correctly");
  }

  /**
   * Test security features
   */
  static testSecurityFeatures(): void {
    console.log("🧪 Testing: Security Features");
    console.log("=============================");

    // Test multiple rate limit scenarios
    const testEmails = ["user1@test.com", "user2@test.com", "user3@test.com"];

    testEmails.forEach((email) => {
      // Test login rate limiting
      for (let i = 0; i < 6; i++) {
        const allowed = this.securityMiddleware.checkRateLimit(email, "login");
        if (!allowed) {
          console.log(
            `🚫 Rate limit triggered for ${email} after ${i} attempts`
          );
          break;
        }
      }

      // Test verification rate limiting
      for (let i = 0; i < 4; i++) {
        const allowed = this.securityMiddleware.checkRateLimit(email, "reset");
        if (!allowed) {
          console.log(
            `🚫 Verification rate limit triggered for ${email} after ${i} attempts`
          );
          break;
        }
      }
    });

    console.log("✅ Rate limiting tests completed");
  }

  /**
   * Clear test data
   */
  static clearTestData(): void {
    this.authLogger.clearLogs();
    console.log("🧹 Test data cleared");
  }

  /**
   * Export test logs for analysis
   */
  static exportTestLogs(): string {
    const logs = this.authLogger.exportLogs();
    console.log("📤 Test logs exported");
    return logs;
  }
}

// Auto-run tests in development
if (import.meta.env.DEV) {
  // Run tests after a short delay to allow app initialization
  setTimeout(() => {
    console.log("🚀 Running Email Verification Tests...\n");
    EmailVerificationTestUtils.simulateUnverifiedUser();
    console.log("\n");
    EmailVerificationTestUtils.testVerificationFlow();
    console.log("\n");
    EmailVerificationTestUtils.testSecurityFeatures();
  }, 2000);
}

export default EmailVerificationTestUtils;
