/**
 * Security Events List Component
 */

import { Activity, Eye } from "lucide-react";
import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Card } from "../../ui/Card";
import type { SecurityEvent } from "../types";
import { EventItem } from "./EventItem";

interface EventsListProps {
  events: SecurityEvent[];
}

export const EventsList: React.FC<EventsListProps> = ({ events }) => {
  const { classes } = useTheme();

  return (
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
            {events.slice(0, 20).map((event) => (
              <EventItem key={event.id} event={event} />
            ))}

            {events.length > 20 && (
              <div className={`text-center pt-4 ${classes.text.secondary}`}>
                <p className="text-sm">Showing 20 of {events.length} events</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EventsList;
