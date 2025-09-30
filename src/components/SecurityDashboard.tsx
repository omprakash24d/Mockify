/**
 * Security Monitoring Dashboard
 * Displays security events and system health for enhanced visibility
 */

import {
  Activity,
  AlertTriangle,
  Clock,
  Eye,
  Lock,
  RefreshCw,
  Shield,
  TrendingUp,
  Unlock,
  UserX,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
// Security manager import removed as not used in current implementation
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface SecurityEvent {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: number;
  description: string;
  userId: string;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  recentLoginAttempts: number;
  activeRateLimits: number;
}

export const SecurityDashboard: React.FC = () => {
  const { classes } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    highSeverityEvents: 0,
    recentLoginAttempts: 0,
    activeRateLimits: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load security events and calculate stats
  const loadSecurityData = () => {
    setLoading(true);

    try {
      // Mock security events for now - in production this would come from your backend
      const securityEvents: SecurityEvent[] = [
        {
          id: "1",
          type: "login_success",
          severity: "low",
          timestamp: Date.now() - 30 * 60 * 1000,
          description: "Successful login",
          userId: "user1",
        },
        {
          id: "2",
          type: "login_failed",
          severity: "medium",
          timestamp: Date.now() - 60 * 60 * 1000,
          description: "Failed login attempt",
          userId: "unknown",
        },
      ];

      setEvents(securityEvents);

      // Calculate statistics
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      const stats: SecurityStats = {
        totalEvents: securityEvents.length,
        criticalEvents: securityEvents.filter(
          (e: SecurityEvent) => e.severity === "critical"
        ).length,
        highSeverityEvents: securityEvents.filter(
          (e: SecurityEvent) => e.severity === "high"
        ).length,
        recentLoginAttempts: securityEvents.filter(
          (e: SecurityEvent) =>
            e.type.includes("login") && e.timestamp > oneHourAgo
        ).length,
        activeRateLimits: securityEvents.filter(
          (e: SecurityEvent) =>
            e.type === "rate_limit_exceeded" && e.timestamp > oneHourAgo
        ).length,
      };

      setStats(stats);
    } catch (error) {
      console.error("Failed to load security data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();

    // Refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case "login_success":
        return <Unlock className="h-4 w-4 text-green-500" />;
      case "login_failure":
        return <Lock className="h-4 w-4 text-red-500" />;
      case "account_locked":
        return <UserX className="h-4 w-4 text-red-600" />;
      case "account_unlocked":
        return <Unlock className="h-4 w-4 text-blue-500" />;
      case "rate_limit_exceeded":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "password_change":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "mfa_enrollment":
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (severity) {
      case "critical":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}
          >
            Critical
          </span>
        );
      case "high":
        return (
          <span
            className={`${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`}
          >
            High
          </span>
        );
      case "medium":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}
          >
            Medium
          </span>
        );
      case "low":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}
          >
            Low
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}
          >
            Unknown
          </span>
        );
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className={`text-3xl font-bold ${classes.text.primary} flex items-center gap-2`}
          >
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className={`${classes.text.secondary} mt-1`}>
            Monitor security events and system health
          </p>
        </div>
        <Button
          onClick={loadSecurityData}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={`p-6 ${classes.bg.primary} ${classes.border.default}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${classes.text.secondary}`}>
                Total Events
              </p>
              <p className={`text-2xl font-bold ${classes.text.primary}`}>
                {stats.totalEvents}
              </p>
            </div>
            <Activity className={`h-8 w-8 ${classes.text.accent}`} />
          </div>
        </Card>

        <Card className={`p-6 ${classes.bg.primary} ${classes.border.error}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${classes.text.secondary}`}>
                Critical Events
              </p>
              <p className={`text-2xl font-bold ${classes.text.error}`}>
                {stats.criticalEvents}
              </p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${classes.text.error}`} />
          </div>
        </Card>

        <Card className={`p-6 ${classes.bg.primary} ${classes.border.warning}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${classes.text.secondary}`}>
                High Severity
              </p>
              <p className={`text-2xl font-bold ${classes.text.warning}`}>
                {stats.highSeverityEvents}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${classes.text.warning}`} />
          </div>
        </Card>

        <Card className={`p-6 ${classes.bg.primary} ${classes.border.success}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${classes.text.secondary}`}>
                Recent Logins
              </p>
              <p className={`text-2xl font-bold ${classes.text.success}`}>
                {stats.recentLoginAttempts}
              </p>
            </div>
            <Lock className={`h-8 w-8 ${classes.text.success}`} />
          </div>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className={`${classes.bg.primary} ${classes.border.default}`}>
        <div
          className={`${classes.bg.secondary} px-6 py-4 border-b ${classes.border.default}`}
        >
          <h2
            className={`text-xl font-semibold ${classes.text.primary} flex items-center gap-2`}
          >
            <Eye className="h-5 w-5" />
            Recent Security Events
          </h2>
        </div>

        <div className="p-6">
          {events.length === 0 ? (
            <div className={`text-center py-8 ${classes.text.secondary}`}>
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events recorded yet</p>
              <p className="text-sm mt-1">
                Events will appear here as they occur
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 20).map((event, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-opacity-50",
                    classes.bg.secondary
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${classes.text.primary}`}>
                        {event.type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </h3>
                      {getSeverityBadge(event.severity)}
                    </div>

                    {event.email && (
                      <p className={`text-sm ${classes.text.secondary} mb-1`}>
                        User: {event.email}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(event.timestamp)}
                      </span>
                      {event.details.sessionId && (
                        <span>
                          Session: {event.details.sessionId.substring(0, 8)}...
                        </span>
                      )}
                    </div>

                    {/* Additional details for specific event types */}
                    {event.type === "rate_limit_exceeded" &&
                      event.details.limit && (
                        <div
                          className={`text-xs ${classes.text.tertiary} mt-1`}
                        >
                          Rate limit: {event.details.count}/
                          {event.details.limit} requests
                        </div>
                      )}

                    {event.type === "account_locked" &&
                      event.details.attemptCount && (
                        <div
                          className={`text-xs ${classes.text.tertiary} mt-1`}
                        >
                          Failed attempts: {event.details.attemptCount}
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {events.length > 20 && (
                <div className={`text-center pt-4 ${classes.text.secondary}`}>
                  <p className="text-sm">
                    Showing 20 of {events.length} events
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Security Tips */}
      <Card className={`mt-8 ${classes.bg.primary} ${classes.border.default}`}>
        <div
          className={`${classes.bg.secondary} px-6 py-4 border-b ${classes.border.default}`}
        >
          <h2
            className={`text-xl font-semibold ${classes.text.primary} flex items-center gap-2`}
          >
            <Shield className="h-5 w-5" />
            Security Best Practices
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-medium ${classes.text.primary} mb-3`}>
                Account Security
              </h3>
              <ul className={`space-y-2 text-sm ${classes.text.secondary}`}>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  Use a strong, unique password
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  Enable two-factor authentication when available
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  Regularly review your security events
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  Log out from shared devices
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`font-medium ${classes.text.primary} mb-3`}>
                Platform Features
              </h3>
              <ul className={`space-y-2 text-sm ${classes.text.secondary}`}>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Automatic account lockout after failed attempts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Rate limiting protects against abuse
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Real-time security event monitoring
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Input sanitization prevents XSS attacks
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
