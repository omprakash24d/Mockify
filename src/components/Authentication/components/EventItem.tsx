/**
 * Security Event Item Component
 */

import { Clock } from "lucide-react";
import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { cn } from "../../../lib/utils";
import type { SecurityEvent } from "../types";
import { formatEventType, formatTimestamp } from "../utils";
import { EventIcon } from "./EventIcon";
import { SeverityBadge } from "./SeverityBadge";

interface EventItemProps {
  event: SecurityEvent;
}

export const EventItem: React.FC<EventItemProps> = ({ event }) => {
  const { classes } = useTheme();

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-opacity-50",
        classes.bg.secondary
      )}
    >
      <div className="flex-shrink-0 mt-1">
        <EventIcon type={event.type} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-medium ${classes.text.primary}`}>
            {formatEventType(event.type)}
          </h3>
          <SeverityBadge severity={event.severity} />
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
          {event.details?.sessionId && (
            <span>Session: {event.details.sessionId.substring(0, 8)}...</span>
          )}
        </div>

        {/* Additional details for specific event types */}
        {event.type === "rate_limit_exceeded" && event.details?.limit && (
          <div className={`text-xs ${classes.text.tertiary} mt-1`}>
            Rate limit: {event.details.count}/{event.details.limit} requests
          </div>
        )}

        {event.type === "account_locked" && event.details?.attemptCount && (
          <div className={`text-xs ${classes.text.tertiary} mt-1`}>
            Failed attempts: {event.details.attemptCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventItem;
