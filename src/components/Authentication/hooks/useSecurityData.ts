/**
 * Security Data Management Hook
 */

import { useEffect, useState } from "react";
import type { SecurityEvent, SecurityStats } from "../types";
import { calculateSecurityStats, generateMockSecurityEvents } from "../utils";

export const useSecurityData = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    highSeverityEvents: 0,
    recentLoginAttempts: 0,
    activeRateLimits: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load security events and calculate stats
  const loadSecurityData = async () => {
    setLoading(true);

    try {
      // Mock security events for now - in production this would come from your backend
      const securityEvents = generateMockSecurityEvents();

      setEvents(securityEvents);

      // Calculate statistics
      const calculatedStats = calculateSecurityStats(securityEvents);
      setStats(calculatedStats);
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

  return {
    events,
    stats,
    loading,
    refetch: loadSecurityData,
  };
};

export default useSecurityData;
